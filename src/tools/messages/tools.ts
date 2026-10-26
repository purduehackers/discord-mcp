/** @fileoverview Registers message operations with validated bodies, encoded reactions, and multipart uploads. */
import { makeURLSearchParams, type REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  Routes,
  MessageFlags,
  type RESTGetAPIChannelMessagesQuery,
  type RESTPostAPIChannelMessageJSONBody,
  type RESTPatchAPIChannelMessageJSONBody,
  type RESTPostAPIChannelMessagesBulkDeleteJSONBody,
} from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** Read one page of channel messages. */
export function fetchMessages(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "fetch_messages",
    {
      description:
        "Read one page of channel messages. Use a returned message ID as before or after to paginate.",
      inputSchema: schemas.fetchInput,
      outputSchema: schemas.messageListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.messageListOutput, async () => {
        const { channel_id, ...query } = input;
        return {
          messages: await rest.get(Routes.channelMessages(channel_id), {
            query: makeURLSearchParams<RESTGetAPIChannelMessagesQuery>(query),
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Read one message, including embeds, attachments, and reply references.. */
export function getMessage(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "get_message",
    {
      description: "Read one message, including embeds, attachments, and reply references.",
      inputSchema: schemas.messageInput,
      outputSchema: schemas.messageOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.messageOutput, async () => {
        return {
          message: await rest.get(Routes.channelMessage(input.channel_id, input.message_id), {
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Send a message with optional embeds, files, and a reply reference. */
export function sendMessage(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "send_message",
    {
      description:
        "Send a message with optional embeds, files, and a reply reference. Mentions are disabled unless explicitly selected.",
      inputSchema: schemas.sendInput,
      outputSchema: schemas.messageOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.messageOutput, async () => {
        const { channel_id, files, suppress_embeds, silent, ...body } = input;
        const flags =
          (suppress_embeds ? MessageFlags.SuppressEmbeds : 0) |
          (silent ? MessageFlags.SuppressNotifications : 0);
        return {
          message: await rest.post(Routes.channelMessages(channel_id), {
            body: { ...body, flags } satisfies RESTPostAPIChannelMessageJSONBody,
            files: files?.map((file) => ({
              name: file.name,
              data: Buffer.from(file.data, "base64"),
              contentType: file.content_type,
            })),
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Edit a message authored by the current identity. */
export function editMessage(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "edit_message",
    {
      description:
        "Edit a message authored by the current identity. Empty content or embeds explicitly clears that field.",
      inputSchema: schemas.editInput,
      outputSchema: schemas.messageOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.messageOutput, async () => {
        const { channel_id, message_id, ...body } = input;
        return {
          message: await rest.patch(Routes.channelMessage(channel_id, message_id), {
            body: body satisfies RESTPatchAPIChannelMessageJSONBody,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Delete one channel message.. */
export function deleteMessage(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "delete_message",
    {
      description: "Delete one channel message.",
      inputSchema: schemas.auditedMessageInput,
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
        await rest.delete(Routes.channelMessage(input.channel_id, input.message_id), {
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}

/** Delete 2–100 distinct messages less than 14 days old. */
export function bulkDeleteMessages(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "bulk_delete_messages",
    {
      description:
        "Delete 2–100 distinct messages less than 14 days old. Discord rejects older messages.",
      inputSchema: schemas.bulkDeleteInput,
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
        await rest.post(Routes.channelBulkDelete(input.channel_id), {
          body: { messages: input.messages } satisfies RESTPostAPIChannelMessagesBulkDeleteJSONBody,
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}

/** Publish an announcement message to following channels.. */
export function crosspostMessage(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "crosspost_message",
    {
      description: "Publish an announcement message to following channels.",
      inputSchema: schemas.messageInput,
      outputSchema: schemas.messageOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.messageOutput, async () => {
        return {
          message: await rest.post(
            Routes.channelMessageCrosspost(input.channel_id, input.message_id),
            { signal: context.mcpReq.signal },
          ),
        };
      }),
  );
}

/** Pin a channel message.. */
export function pinMessage(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "pin_message",
    {
      description: "Pin a channel message.",
      inputSchema: schemas.auditedMessageInput,
      outputSchema: schemas.successSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.successSchema, async () => {
        await rest.put(Routes.channelMessagesPin(input.channel_id, input.message_id), {
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}

/** Unpin a channel message.. */
export function unpinMessage(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "unpin_message",
    {
      description: "Unpin a channel message.",
      inputSchema: schemas.auditedMessageInput,
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
        await rest.delete(Routes.channelMessagesPin(input.channel_id, input.message_id), {
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}

/** Add the current identity's reaction to a message.. */
export function addReaction(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "add_reaction",
    {
      description: "Add the current identity's reaction to a message.",
      inputSchema: schemas.reactionInput,
      outputSchema: schemas.successSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.successSchema, async () => {
        await rest.put(
          Routes.channelMessageOwnReaction(
            input.channel_id,
            input.message_id,
            encodeURIComponent(input.emoji),
          ),
          { signal: context.mcpReq.signal },
        );
        return { success: true };
      }),
  );
}

/** Remove a user's reaction. */
export function removeReaction(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "remove_reaction",
    {
      description: "Remove a user's reaction. Use @me for the current identity.",
      inputSchema: schemas.removeReactionInput,
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
        const emoji = encodeURIComponent(input.emoji);
        const route =
          input.user_id === "@me"
            ? Routes.channelMessageOwnReaction(input.channel_id, input.message_id, emoji)
            : Routes.channelMessageUserReaction(
                input.channel_id,
                input.message_id,
                emoji,
                input.user_id,
              );
        await rest.delete(route, { signal: context.mcpReq.signal });
        return { success: true };
      }),
  );
}

/** Remove every reaction from a message.. */
export function removeAllReactions(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "remove_all_reactions",
    {
      description: "Remove every reaction from a message.",
      inputSchema: schemas.messageInput,
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
        await rest.delete(Routes.channelMessageAllReactions(input.channel_id, input.message_id), {
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}
