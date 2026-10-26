import { afterEach, expect, test } from "bun:test";

import { REST } from "@discordjs/rest";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { panic, Result } from "better-result";

import { createServer } from "../src/create-server";
import { DiscordError } from "../src/discord-error";

const cleanup: (() => Promise<void> | void)[] = [];

afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});

async function connect(
  fetch: (request: Request) => Response | Promise<Response>,
  authPrefix: "Bot" | "Bearer" = "Bot",
) {
  const http = Bun.serve({ port: 0, fetch });
  cleanup.push(() => http.stop(true));
  const rest = new REST({ api: http.url.origin, version: "10", authPrefix, retries: 0 }).setToken(
    "fixture-token",
  );
  const server = createServer(rest);
  const client = new Client({ name: "test", version: "1" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  cleanup.push(() => server.close());
  cleanup.push(() => client.close());
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return client;
}

test("MCP exposes REST methods and route documentation", async () => {
  const client = await connect(() => Response.json({}));
  const { tools } = await client.listTools();
  expect(tools.map((tool) => tool.name).sort()).toEqual([
    "discord_delete",
    "discord_get",
    "discord_patch",
    "discord_post",
    "discord_put",
  ]);
  expect(tools.find((tool) => tool.name === "discord_get")?.annotations?.readOnlyHint).toBe(true);
  expect((await client.listResources()).resources.map((resource) => resource.uri)).toContain(
    "discord://rest",
  );
  const resource = await client.readResource({ uri: "discord://rest" });
  expect(JSON.stringify(resource)).toContain("/users/@me");
});

test.each(["Bot", "Bearer"] as const)(
  "passes through %s authorization, query and upstream JSON",
  async (prefix) => {
    const requests: { url: string; authorization: string | null }[] = [];
    const client = await connect((request) => {
      requests.push({ url: request.url, authorization: request.headers.get("Authorization") });
      return Response.json([{ id: "1234567890123456789", content: "unchanged" }]);
    }, prefix);
    const result = await client.callTool({
      name: "discord_get",
      arguments: {
        route: "/channels/123/messages",
        query: { limit: "2", before: "9876543210987654321" },
      },
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toEndWith(
      "/v10/channels/123/messages?limit=2&before=9876543210987654321",
    );
    expect(requests[0]?.authorization).toBe(prefix + " fixture-token");
    expect(result.structuredContent).toEqual({
      data: [{ id: "1234567890123456789", content: "unchanged" }],
    });
  },
);

test("passes JSON nulls and audit reasons, and handles empty responses", async () => {
  const requests: { method: string; body: string; reason: string | null }[] = [];
  const client = await connect(async (request) => {
    requests.push({
      method: request.method,
      body: await request.text(),
      reason: request.headers.get("x-audit-log-reason"),
    });
    return new Response(undefined, { status: 204 });
  });
  for (const method of ["post", "put", "patch", "delete"]) {
    const result = await client.callTool({
      name: "discord_" + method,
      arguments: {
        route: "/guilds/123",
        body: { description: null },
        reason: "user requested / change",
      },
    });
    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toEqual({ data: null });
  }
  expect(requests.map((request) => request.method)).toEqual(["POST", "PUT", "PATCH", "DELETE"]);
  for (const request of requests) {
    expect(request.body).toBe('{"description":null}');
    expect(request.reason).toBe(encodeURIComponent("user requested / change"));
  }
});

test("wires multipart files and sticker fields through Discord REST", async () => {
  const forms: FormData[] = [];
  const client = await connect(async (request) => {
    forms.push(await request.formData());
    return Response.json({ id: "456" });
  });
  const result = await client.callTool({
    name: "discord_post",
    arguments: {
      route: "/guilds/123/stickers",
      body: { name: "fixture", tags: "wave" },
      appendToFormData: true,
      files: [
        {
          name: "sticker.png",
          data: Buffer.from("fixture bytes").toString("base64"),
          contentType: "image/png",
          key: "file",
        },
      ],
    },
  });
  expect(result.isError).not.toBe(true);
  expect(forms[0]?.get("name")).toBe("fixture");
  expect(forms[0]?.get("tags")).toBe("wave");
  const file = forms[0]?.get("file");
  expect(file).toBeInstanceOf(File);
  if (!(file instanceof File)) panic("Expected an uploaded fixture file.");
  expect(file.name).toBe("sticker.png");
  expect(await file.text()).toBe("fixture bytes");
});

test("returns Discord errors as tool errors without leaking credentials", async () => {
  const client = await connect(() =>
    Response.json({ code: 50013, message: "Missing Permissions" }, { status: 403 }),
  );
  const result = await client.callTool({
    name: "discord_get",
    arguments: { route: "/guilds/123" },
  });
  expect(result.isError).toBe(true);
  expect(JSON.stringify(result)).toContain("Missing Permissions");
  expect(JSON.stringify(result)).not.toContain("fixture-token");
});

test("invalid routes and unknown arguments never reach Discord", async () => {
  let requests = 0;
  const client = await connect(() => {
    requests += 1;
    return Response.json({});
  });
  for (const args of [
    { route: "https://example.com" },
    { route: "//example.com" },
    { route: "/users?token=secret" },
    { route: "/users/@me", token: "secret" },
  ]) {
    const result = await Result.tryPromise({
      try: () => client.callTool({ name: "discord_get", arguments: args }),
      catch: () => new DiscordError({ message: "Invalid MCP request." }),
    });
    expect(result.isErr() || result.value.isError).toBe(true);
  }
  expect(requests).toBe(0);
});

test.each(["legacy", "auto"] as const)(
  "stdio supports the official client's %s negotiation",
  async (mode) => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["--no-env-file", import.meta.dir + "/../src/index.ts"],
      env: { DISCORD_TOKEN: "fixture-token" },
      stderr: "pipe",
    });
    const client = new Client(
      { name: "stdio-test", version: "1" },
      { versionNegotiation: { mode } },
    );
    cleanup.push(() => client.close());
    await client.connect(transport);
    if (mode === "auto") expect(client.getDiscoverResult()).toBeDefined();
    expect((await client.listTools()).tools).toHaveLength(5);
    expect((await client.listResources()).resources).toHaveLength(1);
  },
);

test("missing credentials fail on stderr without corrupting MCP stdout", async () => {
  const child = Bun.spawn(
    [process.execPath, "--no-env-file", import.meta.dir + "/../src/index.ts"],
    {
      env: {},
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  expect(code).toBe(1);
  expect(stdout).toBe("");
  expect(stderr).toContain("Set DISCORD_TOKEN or DISCORD_BOT_TOKEN.");
});
