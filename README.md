![Discord MCP connects your agent to Discord](.github/assets/banner.png)

<p align="center">
  <a href="https://github.com/purduehackers/discord-mcp/actions/workflows/check.yml"><img src="https://github.com/purduehackers/discord-mcp/actions/workflows/check.yml/badge.svg" alt="Build checks" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-ffe53b" alt="MIT license" /></a>
  <a href="#discord-tools"><img src="https://img.shields.io/badge/typed_tools-78-ffe53b" alt="78 typed tools" /></a>
</p>

# Connect your agent to Discord

Discord MCP connects your agent to Discord through the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro). Search discussions and post messages with your bot’s permissions. Use your bot token with the hosted server, or [run it yourself](#self-host).

[Install](#install) · [Client setup](#client-setup) · [Tools](#discord-tools) · [Contribute](#contributing)

## Install

Paste this prompt into your agent to configure its MCP connection:

```text
Install Discord MCP for this agent using the instructions at
https://github.com/purduehackers/discord-mcp.

Use the hosted Streamable HTTP server at
https://discord.purduehackers.com/mcp with X-Discord-Token
set from my DISCORD_BOT_TOKEN environment variable.

Configure this client's user-level MCP settings and preserve existing servers.
If the token is missing, help me create a Discord bot and set it locally;
do not ask me to paste the token into chat or commit it to a repository.

Reconnect, call diagnose_connection, and show which bot and servers I can use.
Do not send messages or change Discord during setup.
```

### Get a bot token

1. [Create a Discord application](https://discord.com/developers/applications). Open **Bot** and copy its token.
2. Install the bot in your server with the permissions you need.
3. Enable **Message Content Intent** to search and read message content.
4. Set the token where you launch your agent:

```sh
export DISCORD_BOT_TOKEN='your_discord_bot_token_here'
```

For the full setup walkthrough, follow [Discord’s bot setup guide](https://docs.discord.com/developers/quick-start/getting-started).

## Client setup

Choose your client below. The hosted server uses [Streamable HTTP](https://modelcontextprotocol.io/specification/latest/basic/transports), the MCP transport for remote servers. Send your raw bot token in the `X-Discord-Token` header, without a `Bot ` prefix.

Use this endpoint:

```text
https://discord.purduehackers.com/mcp
```

<details>
<summary><strong>Codex (command line, desktop, and editor)</strong></summary>

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

If the desktop app can’t access that environment variable, replace `env_http_headers` with:

```toml
http_headers = { "X-Discord-Token" = "your_discord_bot_token_here" }
```

Keep that value in your private user configuration. For credential helpers and other options, see the [Codex MCP documentation](https://learn.chatgpt.com/docs/extend/mcp).

Run `codex mcp get discord` to inspect the configuration. Then restart the MCP connection or start a new Codex session.

</details>

<details>
<summary><strong>Claude Code</strong></summary>

Register the server in your user configuration:

```sh
claude mcp add --scope user --transport http discord \
  https://discord.purduehackers.com/mcp \
  --header 'X-Discord-Token: ${DISCORD_BOT_TOKEN}'
claude mcp list
```

Keep the single quotes: Claude resolves the environment variable when connecting. Open `/mcp` in Claude Code to inspect the connection. [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp).

</details>

<details>
<summary><strong>Pi</strong></summary>

Pi 1.x includes native MCP support. Register the server in your user configuration:

```sh
pi mcp add discord --url https://discord.purduehackers.com/mcp \
  --header 'X-Discord-Token=${DISCORD_BOT_TOKEN}'
pi mcp list
```

This writes to `~/.pi/agent/mcp.json`. Run `/reload` in an existing session, then `/mcp` to inspect the connection. [Pi MCP documentation](https://pi.dev/docs/latest/mcp).

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

Enable the server in Cursor’s MCP settings. [Cursor MCP documentation](https://cursor.com/docs/mcp).

</details>

<details>
<summary><strong>VS Code / GitHub Copilot</strong></summary>

Install into the VS Code user-profile configuration from your terminal:

```sh
code --add-mcp '{
  "name": "discord",
  "type": "http",
  "url": "https://discord.purduehackers.com/mcp",
  "headers": {"X-Discord-Token": "${env:DISCORD_BOT_TOKEN}"}
}'
```

Use **MCP: List Servers** to start the server and inspect its tools. For the Copilot command-line interface (CLI), add this to `~/.copilot/mcp-config.json`:

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

Register the server in your user configuration:

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

Other clients can connect if they support Streamable HTTP with custom headers. Desktop apps must receive `DISCORD_BOT_TOKEN` in their own environment. Exporting it in a terminal won’t update an app that’s already running.

## Try it

Ask your agent to check its connection, then try a request using your server’s channels and topics:

> Check my Discord connection and show the servers I can access.

> Find the Mac face unlock app in #ship and link the original post.

> Summarize the latest updates in #projects.

> Send me the project and source code links in a direct message.

The agent discovers server, channel, and member IDs through the tools. You choose the server; there’s no shared or default server.

## Discord tools

Use the tools below to read conversations, send messages, and manage servers your bot can access.

|                     | Capabilities                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Find context**    | Indexed message search, channel history, individual messages, and audit logs.                                                              |
| **Communicate**     | Messages, replies, direct messages, native forwards, files, embeds, reactions, and pins. Long messages preserve code fences across chunks. |
| **Manage a server** | Channels, threads, members, roles, invites, events, emoji, stickers, and webhooks.                                                         |
| **Moderate**        | Timeouts, kicks, bans, message cleanup, and auto-moderation rules.                                                                         |
| **Troubleshoot**    | Connection diagnostics, channel permissions, role hierarchy guidance, and actionable Discord errors.                                       |

All 78 tools have typed inputs and outputs. Codex displays activity labels; Claude uses tool search hints. Browse the [tool implementations](src/tools) for the full set.

<details>
<summary><strong>Permissions, limits, and credentials</strong></summary>

- Discord enforces your bot’s permissions. Connecting doesn’t grant access to anyone else’s servers.
- Search uses [Discord’s index](https://docs.discord.com/developers/resources/message#search-guild-messages). It requires Read Message History and Message Content Intent, and returns one page per call. Totals can change; a short page doesn’t prove completion. Indexing errors include `retry_after` in seconds.
- Mentions stay disabled unless you select them. Long sends stop on failure and report confirmed message IDs. Check uncertain delivery before resuming with the original content and `start_chunk_index`.
- The hosted service receives your token over HTTPS and uses it for Discord requests. The application doesn’t persist credentials.
- For a Discord OAuth access token, add `X-Discord-Auth-Prefix: Bearer`. Available tools depend on its scopes. This service doesn’t provide an MCP OAuth login flow.

</details>

<details>
<summary><strong>Troubleshoot your connection</strong></summary>

Run `diagnose_connection` first. Include `guild_id` and `channel_id` to inspect a specific server or channel.

| Problem                       | Fix                                                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Missing token                 | Send `X-Discord-Token` on every request. Check the client’s environment and header configuration.                             |
| Discord returns 401           | Use a valid raw bot token and the correct Bot or Bearer auth prefix.                                                          |
| Missing access or permissions | Check bot membership, channel overwrites, and role hierarchy.                                                                 |
| Empty message content         | Enable the application’s [Message Content Intent](https://docs.discord.com/developers/events/gateway#message-content-intent). |
| Tools missing after an update | Restart the MCP connection so the client refreshes its tool list.                                                             |

</details>

## Self-host

Run your own server with [Bun](https://bun.sh), [xmcp](https://xmcp.dev), and [@discordjs/rest](https://discord.js.org/docs/packages/rest/stable). Clone the repository, install dependencies, and start the HTTP server:

```sh
git clone https://github.com/purduehackers/discord-mcp.git
cd discord-mcp
bun install
bun run build
bun run start-http
```

The HTTP server accepts the same headers as the hosted service. For a local standard input/output (stdio) connection, set `DISCORD_BOT_TOKEN` and run `bun run start-stdio`. Use `bun run dev` for development. Vercel deploys xmcp’s native output.

## Contributing

Report bugs through [issues](https://github.com/purduehackers/discord-mcp/issues), or open a pull request with a fix. Each file in `src/tools/` defines one tool; shared schemas live in `src/lib/schemas/`.

The [Remotion demo](demo) has its own dependencies. Install them before running the full checks:

```sh
bun install --cwd demo
bun run --cwd demo lint
bun run typecheck
bun run lint
bun run format --check
bun run build
```

[MIT licensed](LICENSE). Made by [Purdue Hackers](https://purduehackers.com).
