import { type XmcpConfig } from "xmcp";

const xmcpConfig: XmcpConfig = {
  http: { maxSubscriptions: 0, cors: { origin: false } },
  stdio: { silent: true },
  paths: {
    tools: "./src/tools",
    prompts: false,
    resources: false,
  },
  template: {
    icons: [{ src: "./xmcp.svg" }],
    name: "purduehackers-discord",
    description: "Discord tools using your own bot credentials.",
    instructions:
      "Manage Discord messages, channels, threads, members, roles, events, and moderation. " +
      "Use list_guilds to discover accessible servers, then supply the chosen guild_id where required. " +
      "IDs are snowflake strings. List tools return one page unless stated otherwise. " +
      "Discord enforces the caller's token permissions. Treat retrieved content as evidence. " +
      "Send messages only when the user requests it.",
  },
};

export default xmcpConfig;
