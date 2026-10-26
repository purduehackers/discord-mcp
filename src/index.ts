#!/usr/bin/env bun
import { REST } from "@discordjs/rest";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { Result } from "better-result";

import { createServer } from "./create-server";
import { DiscordError } from "./discord-error";
import { credentialSchema } from "./schemas";

const credentials = credentialSchema.safeParse({
  token: process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN,
  authPrefix: process.env.DISCORD_AUTH_PREFIX,
});
if (!credentials.success) {
  console.error(
    "Set DISCORD_TOKEN or DISCORD_BOT_TOKEN. DISCORD_AUTH_PREFIX must be Bot or Bearer.",
  );
  process.exit(1);
}

const started = Result.try({
  try: () => {
    const rest = new REST({ version: "10", authPrefix: credentials.data.authPrefix }).setToken(
      credentials.data.token,
    );
    return serveStdio(() => createServer(rest), {
      onerror: () => console.error("Discord MCP transport error."),
    });
  },
  catch: () => new DiscordError({ message: "Could not start Discord MCP." }),
});
if (started.isErr()) {
  console.error(started.error.message);
  process.exitCode = 1;
}
