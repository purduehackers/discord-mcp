import type { REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import { Routes, type RESTPostAPIChannelInviteJSONBody } from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** List the guild's invites and usage metadata.. */
export function listInvites(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_invites",
    {
      description: "List the guild's invites and usage metadata.",
      inputSchema: schemas.listInput,
      outputSchema: schemas.inviteListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.inviteListOutput, async () => {
        return {
          invites: await rest.get(Routes.guildInvites(input.guild_id), {
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Create a channel invite. */
export function createInvite(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "create_invite",
    {
      description:
        "Create a channel invite. The returned code forms https://discord.gg/<code>; max_age 0 makes it permanent.",
      inputSchema: schemas.createInput,
      outputSchema: schemas.inviteOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.inviteOutput, async () => {
        const { channel_id, reason, ...body } = input;
        return {
          invite: await rest.post(Routes.channelInvites(channel_id), {
            body: body satisfies RESTPostAPIChannelInviteJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Revoke an invite code for everyone who has it.. */
export function deleteInvite(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "delete_invite",
    {
      description: "Revoke an invite code for everyone who has it.",
      inputSchema: schemas.deleteInput,
      outputSchema: schemas.inviteOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.inviteOutput, async () => {
        return {
          invite: await rest.delete(Routes.invite(input.code), {
            reason: input.reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}
