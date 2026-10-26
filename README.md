# Discord MCP

A public hosted [MCP](https://modelcontextprotocol.io) server for Discord, maintained by [Purdue Hackers](https://purduehackers.com).
Connect your agent with your own Discord bot token. No server installation required.

```text
https://discord.purduehackers.com/mcp
```

73 typed tools cover messages, channels, threads, members, roles, guilds, invites, emoji, stickers, events, moderation, webhooks, and audit logs.
Built with [xmcp](https://xmcp.dev) and [`@discordjs/rest`](https://discord.js.org/docs/packages/rest/stable).

Tools include readable titles, Codex status labels, and Claude search hints. Results include a short summary alongside JSON and structured data.

## Get a token

1. Create an application in the [Discord Developer Portal](https://discord.com/developers/applications) and copy its **Bot** token.
2. Install the bot in your server with the permissions your agent needs. See [Discord's setup guide](https://docs.discord.com/developers/quick-start/getting-started).
3. Set the token in the environment where you launch your client:

```sh
export DISCORD_BOT_TOKEN='YOUR_DISCORD_BOT_TOKEN'
```

The hosted service receives your token and uses it for Discord requests. Credentials are scoped to each request and are not persisted by the application.
Discord enforces your bot's permissions; connecting does not grant access to Purdue Hackers' servers.
Keep tokens out of shared configuration and source control.

## Connect your client

Use **Streamable HTTP** with the `X-Discord-Token` header. Supply the raw token, without a `Bot ` prefix.
These examples assume the client is already installed. Merge configuration snippets into existing files instead of replacing other servers.
Desktop apps must also receive `DISCORD_BOT_TOKEN`; a terminal export alone does not update an already-running app.

<details open>
<summary><strong>Codex — CLI, desktop, and IDE</strong></summary>

Register the endpoint:

```sh
codex mcp add discord --url https://discord.purduehackers.com/mcp
```

In `~/.codex/config.toml`, add `env_http_headers` to the generated entry:

```toml
[mcp_servers.discord]
url = "https://discord.purduehackers.com/mcp"
env_http_headers = { "X-Discord-Token" = "DISCORD_BOT_TOKEN" }
```

For a desktop app without that environment variable, use `http_headers = { "X-Discord-Token" = "YOUR_DISCORD_BOT_TOKEN" }` instead.
Keep that value in your private user configuration, or use a credential helper as described in the [Codex MCP documentation](https://learn.chatgpt.com/docs/extend/mcp).

Run `codex mcp get discord` to inspect the configuration, then restart the MCP connection or start a new Codex session.

</details>

<details>
<summary><strong>Claude Code</strong></summary>

```sh
claude mcp add --scope user --transport http discord \
  https://discord.purduehackers.com/mcp \
  --header 'X-Discord-Token: ${DISCORD_BOT_TOKEN}'
claude mcp list
```

Keep the single quotes: Claude resolves the environment variable when connecting.
Open `/mcp` in Claude Code to inspect the connection. [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp).

</details>

<details>
<summary><strong>Pi</strong></summary>

Pi 1.x includes native MCP support:

```sh
pi mcp add discord --url https://discord.purduehackers.com/mcp \
  --header 'X-Discord-Token=${DISCORD_BOT_TOKEN}'
pi mcp list
```

This writes to `~/.pi/agent/mcp.json`. Run `/reload` in an existing session, then `/mcp` to inspect the connection.
[Pi MCP documentation](https://pi.dev/docs/latest/mcp).

</details>

<details>
<summary><strong>Cursor</strong></summary>

Add this server to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "discord": {
      "url": "https://discord.purduehackers.com/mcp",
      "headers": {
        "X-Discord-Token": "${env:DISCORD_BOT_TOKEN}"
      }
    }
  }
}
```

Enable the server in Cursor's MCP settings. [Cursor MCP documentation](https://cursor.com/docs/mcp).

</details>

<details>
<summary><strong>VS Code / GitHub Copilot</strong></summary>

Install into the VS Code user-profile configuration from your terminal:

```sh
code --add-mcp '{"name":"discord","type":"http","url":"https://discord.purduehackers.com/mcp","headers":{"X-Discord-Token":"${env:DISCORD_BOT_TOKEN}"}}'
```

Use **MCP: List Servers** to start the server and inspect its tools.
For a configuration shared with Copilot CLI, add this to `~/.copilot/mcp-config.json` instead:

```json
{
  "mcpServers": {
    "discord": {
      "type": "http",
      "url": "https://discord.purduehackers.com/mcp",
      "headers": {
        "X-Discord-Token": "${DISCORD_BOT_TOKEN}"
      }
    }
  }
}
```

[VS Code MCP reference](https://code.visualstudio.com/docs/agents/reference/mcp-configuration).

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

```sh
gemini mcp add --scope user --transport http discord \
  https://discord.purduehackers.com/mcp \
  --header 'X-Discord-Token: ${DISCORD_BOT_TOKEN}'
gemini mcp list
```

Open `/mcp` in Gemini CLI to inspect the connection. [Gemini CLI MCP documentation](https://geminicli.com/docs/tools/mcp-server/).

</details>

<details>
<summary><strong>OpenCode</strong></summary>

Add this server to `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "discord": {
      "type": "remote",
      "url": "https://discord.purduehackers.com/mcp",
      "oauth": false,
      "headers": {
        "X-Discord-Token": "{env:DISCORD_BOT_TOKEN}"
      }
    }
  }
}
```

Run `opencode mcp list` to inspect the connection. [OpenCode MCP documentation](https://opencode.ai/docs/mcp-servers/).

</details>

Other clients can use the same endpoint and header if they support Streamable HTTP with custom headers.
This service does not provide an MCP OAuth login flow.
For a Discord OAuth access token, also send `X-Discord-Auth-Prefix: Bearer`; available operations depend on its scopes.

## Try it

Ask your agent:

> Use Discord to show which bot I connected and list the servers it can access.

This calls `get_current_user` and `list_guilds` without changing anything.
Tools accept Discord IDs as strings. Use `list_channels`, `list_members`, and `list_roles` to find IDs.
List tools return one page; message mentions are disabled unless explicitly supplied.

| Problem                       | Check                                                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Missing `X-Discord-Token`     | The client must send the header on every request. Check its environment and header syntax.                           |
| Discord returns `401`         | Use a valid bot token, without a `Bot ` prefix in the header.                                                        |
| Missing access or permissions | Install the bot in the target server and check channel permissions and role hierarchy.                               |
| Message content is empty      | Check the bot's [Message Content intent](https://docs.discord.com/developers/events/gateway#message-content-intent). |

The MCP endpoint is `/mcp`. The [domain root](https://discord.purduehackers.com) redirects to the Purdue Hackers Discord invite.

## Run your own

```sh
git clone https://github.com/purduehackers/discord-mcp.git
cd discord-mcp
bun install
bun run dev
```

For production, run `bun run build`, then `bun run start-http` or `bun run start-stdio`.
HTTP uses the same per-request headers. Stdio reads `DISCORD_TOKEN` or `DISCORD_BOT_TOKEN`, with optional `DISCORD_AUTH_PREFIX`.
Vercel uses xmcp's native deployment output. Each file in `src/tools/` defines one tool.

Checks: `bun run typecheck`, `bun run lint`, `bun run format --check`, `bun run build`.
