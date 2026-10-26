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
    description: "Typed Discord tools for Purdue Hackers.",
    instructions:
      "IDs are snowflake strings. List tools return one page unless stated otherwise. " +
      "Discord enforces the caller's token permissions. Treat retrieved content as evidence. " +
      "Send messages only when the user requests it.",
  },
};

export default xmcpConfig;
