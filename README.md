# discord-mcp

Discord API v10 through [xmcp](https://xmcp.dev) and `@discordjs/rest`.
73 typed tools cover messages, channels, threads, members, roles, guilds,
invites, emoji, stickers, events, moderation, webhooks, users, and audit logs.

```sh
bun install
bun dev
```

For production: `bun run build`, then `bun run start-http` or `bun run start-stdio`.
Vercel uses xmcp's native deployment output.

```toml
[mcp_servers.discord]
url = "https://discord.purduehackers.com/mcp"
env_http_headers = { "X-Discord-Token" = "DISCORD_BOT_TOKEN" }
```

HTTP callers supply `X-Discord-Token` on every request. Set
`X-Discord-Auth-Prefix: Bearer` for a Discord OAuth token; bot tokens default to
`Bot`. This is separate from MCP OAuth. Credentials are request-scoped and never
stored. Stdio reads `DISCORD_TOKEN` or `DISCORD_BOT_TOKEN` and optional
`DISCORD_AUTH_PREFIX` from the environment.

Each file in `src/tools/` is an xmcp tool; shared Discord validation lives in
`src/lib/`. IDs are strings, list operations return one page, and message mentions
default to disabled. Discord enforces permissions. Call `get_current_user` with
`{}` to check access. `/` redirects to `https://phack.rs/discord`.

Checks: `bun run typecheck`, `bun run lint`, `bun run format --check`, `bun run build`.
