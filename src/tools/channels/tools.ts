import type { REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  Routes,
  type RESTPostAPIGuildChannelJSONBody,
  type RESTPatchAPIChannelJSONBody,
  type RESTPostAPIChannelFollowersJSONBody,
} from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** Read a channel's settings, parent, and permission overwrites.. */
export function getChannel(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "get_channel",
    {
      description: "Read a channel's settings, parent, and permission overwrites.",
      inputSchema: schemas.channelInput,
      outputSchema: schemas.channelOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.channelOutput, async () => {
        return {
          channel: await rest.get(Routes.channel(input.channel_id), {
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** List a guild's channels and categories. */
export function listChannels(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_channels",
    {
      description:
        "List a guild's channels and categories. Active threads are available through list_threads.",
      inputSchema: schemas.guildInput,
      outputSchema: schemas.channelListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.channelListOutput, async () => {
        return {
          channels: await rest.get(Routes.guildChannels(input.guild_id), {
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Create a guild channel or category with typed Discord settings.. */
export function createChannel(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "create_channel",
    {
      description: "Create a guild channel or category with typed Discord settings.",
      inputSchema: schemas.createChannelInput,
      outputSchema: schemas.channelOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.channelOutput, async () => {
        const { guild_id, reason, ...body } = input;
        return {
          channel: await rest.post(Routes.guildChannels(guild_id), {
            body: body satisfies RESTPostAPIGuildChannelJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Update selected channel settings. */
export function editChannel(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "edit_channel",
    {
      description:
        "Update selected channel settings. Pass null to clear a parent category or automatic voice region.",
      inputSchema: schemas.editChannelInput,
      outputSchema: schemas.channelOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.channelOutput, async () => {
        const { channel_id, reason, ...body } = input;
        return {
          channel: await rest.patch(Routes.channel(channel_id), {
            body: body satisfies RESTPatchAPIChannelJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Delete a channel and its message history, or remove a category.. */
export function deleteChannel(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "delete_channel",
    {
      description: "Delete a channel and its message history, or remove a category.",
      inputSchema: schemas.deleteChannelInput,
      outputSchema: schemas.channelOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.channelOutput, async () => {
        return {
          channel: await rest.delete(Routes.channel(input.channel_id), {
            reason: input.reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Follow an announcement channel into a destination channel.. */
export function followAnnouncementChannel(
  server: McpServer,
  rest: REST,
  respond: typeof discordResult,
) {
  server.registerTool(
    "follow_announcement_channel",
    {
      description: "Follow an announcement channel into a destination channel.",
      inputSchema: schemas.followInput,
      outputSchema: schemas.followOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.followOutput, async () => {
        return await rest.post(Routes.channelFollowers(input.channel_id), {
          body: {
            webhook_channel_id: input.webhook_channel_id,
          } satisfies RESTPostAPIChannelFollowersJSONBody,
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
      }),
  );
}
