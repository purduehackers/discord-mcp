import { makeURLSearchParams, type REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  Routes,
  type RESTPostAPIChannelThreadsJSONBody,
  type RESTPostAPIChannelMessagesThreadsJSONBody,
  type RESTPatchAPIChannelJSONBody,
  type RESTGetAPIChannelThreadsArchivedQuery,
} from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** List all active threads visible to the current identity in a guild.. */
export function listThreads(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_threads",
    {
      description: "List all active threads visible to the current identity in a guild.",
      inputSchema: schemas.guildInput,
      outputSchema: schemas.threadListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.threadListOutput, async () => {
        return await rest.get(Routes.guildActiveThreads(input.guild_id), {
          signal: context.mcpReq.signal,
        });
      }),
  );
}

/** Read one page of archived threads. */
export function listArchivedThreads(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_archived_threads",
    {
      description:
        "Read one page of archived threads. Use the last archive_timestamp as before, or the thread ID for joined_private.",
      inputSchema: schemas.archivedInput,
      outputSchema: schemas.threadListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.threadListOutput, async () => {
        const route =
          input.visibility === "joined_private"
            ? Routes.channelJoinedArchivedThreads(input.channel_id)
            : Routes.channelThreads(input.channel_id, input.visibility);
        return await rest.get(route, {
          query: makeURLSearchParams<RESTGetAPIChannelThreadsArchivedQuery>({
            before: input.before,
            limit: input.limit,
          }),
          signal: context.mcpReq.signal,
        });
      }),
  );
}

/** Create a standalone public or private thread in a text channel.. */
export function createThread(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "create_thread",
    {
      description: "Create a standalone public or private thread in a text channel.",
      inputSchema: schemas.createInput,
      outputSchema: schemas.threadOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.threadOutput, async () => {
        const { channel_id, reason, ...body } = input;
        return {
          thread: await rest.post(Routes.threads(channel_id), {
            body: body satisfies RESTPostAPIChannelThreadsJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Start a thread attached to an existing channel message.. */
export function createThreadFromMessage(
  server: McpServer,
  rest: REST,
  respond: typeof discordResult,
) {
  server.registerTool(
    "create_thread_from_message",
    {
      description: "Start a thread attached to an existing channel message.",
      inputSchema: schemas.fromMessageInput,
      outputSchema: schemas.threadOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.threadOutput, async () => {
        const { channel_id, message_id, reason, ...body } = input;
        return {
          thread: await rest.post(Routes.threads(channel_id, message_id), {
            body: body satisfies RESTPostAPIChannelMessagesThreadsJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Update thread name, archival state, lock state, invitations, or slowmode.. */
export function editThread(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "edit_thread",
    {
      description: "Update thread name, archival state, lock state, invitations, or slowmode.",
      inputSchema: schemas.editInput,
      outputSchema: schemas.threadOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.threadOutput, async () => {
        const { thread_id, reason, ...body } = input;
        return {
          thread: await rest.patch(Routes.channel(thread_id), {
            body: body satisfies RESTPatchAPIChannelJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Delete a thread and its message history.. */
export function deleteThread(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "delete_thread",
    {
      description: "Delete a thread and its message history.",
      inputSchema: schemas.deleteInput,
      outputSchema: schemas.threadOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.threadOutput, async () => {
        return {
          thread: await rest.delete(Routes.channel(input.thread_id), {
            reason: input.reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}
