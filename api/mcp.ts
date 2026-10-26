import { REST } from "@discordjs/rest";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { Result } from "better-result";

import { DiscordError } from "../src/errors";
import { credentialSchema } from "../src/schemas";
import { createServer } from "../src/server";

/** Serves MCP with caller-supplied Discord credentials scoped to one HTTP request. */
async function fetch(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  if (origin && origin !== URL.parse(request.url)?.origin) {
    return Response.json({ error: "Origin is not allowed." }, { status: 403 });
  }
  const credentials = credentialSchema.safeParse({
    token: request.headers.get("x-discord-token") ?? undefined,
    authPrefix: request.headers.get("x-discord-auth-prefix") ?? undefined,
  });
  if (!credentials.success) {
    return Response.json(
      { error: "Set X-Discord-Token. X-Discord-Auth-Prefix must be Bot or Bearer." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const response = await Result.tryPromise({
    try: () => {
      const rest = new REST({ version: "10", authPrefix: credentials.data.authPrefix }).setToken(
        credentials.data.token,
      );
      const handler = createMcpHandler(() => createServer(rest));
      return handler.fetch(request);
    },
    catch: () => new DiscordError({ message: "Discord MCP transport failed." }),
  });
  if (response.isErr()) {
    return Response.json(
      { error: response.error.message },
      { status: 500, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  response.value.headers.set("Cache-Control", "private, no-store");
  return response.value;
}

export default { fetch };
