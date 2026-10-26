# discord-mcp

Discord API v10 over the official MCP v2 SDK and `@discordjs/rest`.
Named tools expose messages, channels, threads, members, roles, guilds, invites,
emoji, stickers, scheduled events, auto-moderation, webhooks, users, and audit logs.
Each tool declares input and output schemas. Requests use Discord's official
types; responses are validated and projected into structured MCP results.
Discord.js handles rate limits and retries. Discord enforces token permissions.

Hosted endpoint: `https://discord.purduehackers.com/mcp`. Send the caller's
Discord token in `X-Discord-Token` on every request. For Discord OAuth tokens,
also set `X-Discord-Auth-Prefix: Bearer`; bot tokens use the default `Bot` prefix.
This is an explicit integration credential, separate from MCP OAuth authorization.
The server does not store tokens or use a shared bot credential.

```toml
[mcp_servers.discord]
url = "https://discord.purduehackers.com/mcp"
env_http_headers = { "X-Discord-Token" = "DISCORD_BOT_TOKEN" }
```

For local stdio:

```sh
bun install --frozen-lockfile
# Put DISCORD_TOKEN in .env.local, then:
bun start
```

Uses standard MCP stdio, including compatibility with older MCP clients.
`DISCORD_BOT_TOKEN` is also accepted. Set `DISCORD_AUTH_PREFIX=Bearer` for a
Discord OAuth access token. Tokens stay in the process environment, never tool
arguments.

```toml
[mcp_servers.discord]
command = "bun"
args = ["--env-file", "/absolute/path/.env.local", "/absolute/path/discord-mcp/src/index.ts"]
```

Call `get_current_user` with `{}` to verify access, then discover operations
with MCP `tools/list`. For example, `fetch_messages` accepts `channel_id`,
`limit`, and an optional history cursor. `send_message` accepts content, embeds,
replies, and base64 files. Its mentions default to disabled.

IDs are strings. Guild tools take an explicit `guild_id`. List tools return one
page unless stated otherwise. Webhook outputs exclude secret tokens and URLs.
Errors use MCP `isError`. Each domain keeps its schemas beside its registrations
under `src/tools/`; `server.ts` assembles the server and validates results.

Checks: `bun run lint`, `bun run format --check`, `bun run typecheck`.
