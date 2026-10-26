import type { REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  Routes,
  type RESTPostAPIGuildEmojiJSONBody,
  type RESTPatchAPIGuildEmojiJSONBody,
} from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** List a guild's custom emoji and role restrictions.. */
export function listEmojis(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_emojis",
    {
      description: "List a guild's custom emoji and role restrictions.",
      inputSchema: schemas.guildInput,
      outputSchema: schemas.emojiListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.emojiListOutput, async () => {
        return {
          emojis: await rest.get(Routes.guildEmojis(input.guild_id), {
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Upload a custom emoji from an image data URI.. */
export function createEmoji(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "create_emoji",
    {
      description: "Upload a custom emoji from an image data URI.",
      inputSchema: schemas.createInput,
      outputSchema: schemas.emojiOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.emojiOutput, async () => {
        const { guild_id, reason, ...body } = input;
        return {
          emoji: await rest.post(Routes.guildEmojis(guild_id), {
            body: body satisfies RESTPostAPIGuildEmojiJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Change a custom emoji's name or role restrictions.. */
export function editEmoji(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "edit_emoji",
    {
      description: "Change a custom emoji's name or role restrictions.",
      inputSchema: schemas.editInput,
      outputSchema: schemas.emojiOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.emojiOutput, async () => {
        const { guild_id, emoji_id, reason, ...body } = input;
        return {
          emoji: await rest.patch(Routes.guildEmoji(guild_id, emoji_id), {
            body: body satisfies RESTPatchAPIGuildEmojiJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Delete a guild's custom emoji.. */
export function deleteEmoji(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "delete_emoji",
    {
      description: "Delete a guild's custom emoji.",
      inputSchema: schemas.deleteInput,
      outputSchema: schemas.successSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.successSchema, async () => {
        await rest.delete(Routes.guildEmoji(input.guild_id, input.emoji_id), {
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}
