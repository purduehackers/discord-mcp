# discord-mcp

Discord API v10 over the official MCP v2 SDK and `@discordjs/rest`.
Five tools map directly to GET, POST, PUT, PATCH, and DELETE. Discord.js handles
rate limits and retries. Discord enforces the supplied credentials' permissions.

```sh
bun install --frozen-lockfile
# Put DISCORD_TOKEN in .env.local, then:
bun start
```

Uses standard MCP stdio, including compatibility with older MCP clients.
`DISCORD_BOT_TOKEN` is also accepted. Set `DISCORD_AUTH_PREFIX=Bearer` for a
Discord OAuth access token. Tokens stay in the process environment, never tool
arguments. There is no token broker, account mapping, gateway, or hosted service.

```toml
[mcp_servers.discord]
command = "bun"
args = ["--env-file", "/absolute/path/.env.local", "/absolute/path/discord-mcp/src/index.ts"]
```

Call `discord_get` with `{"route":"/users/@me"}` to verify access. Other tools
use the same `route`, optional `query`, `body`, audit `reason`, and base64 `files`.
Responses preserve Discord's JSON under `structuredContent.data`. Upstream
failures use MCP `isError`. The `discord://rest` resource has route examples.

Checks: `bun run lint`, `bun run format --check`, `bun run typecheck`, `bun test`.
