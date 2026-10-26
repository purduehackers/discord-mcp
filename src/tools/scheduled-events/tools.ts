import { makeURLSearchParams, type REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  Routes,
  type RESTGetAPIGuildScheduledEventsQuery,
  type RESTPostAPIGuildScheduledEventJSONBody,
  type RESTPatchAPIGuildScheduledEventJSONBody,
} from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** List a guild's scheduled Discord events and subscriber counts.. */
export function listEvents(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_events",
    {
      description: "List a guild's scheduled Discord events and subscriber counts.",
      inputSchema: schemas.listInput,
      outputSchema: schemas.eventListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.eventListOutput, async () => {
        return {
          events: await rest.get(Routes.guildScheduledEvents(input.guild_id), {
            query: makeURLSearchParams<RESTGetAPIGuildScheduledEventsQuery>({
              with_user_count: input.with_user_count,
            }),
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Create a voice, stage, or external Discord event. */
export function createEvent(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "create_event",
    {
      description:
        "Create a voice, stage, or external Discord event. External events require location and end time.",
      inputSchema: schemas.createInput,
      outputSchema: schemas.eventOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.eventOutput, async () => {
        const { guild_id, reason, ...body } = input;
        return {
          event: await rest.post(Routes.guildScheduledEvents(guild_id), {
            body: body satisfies RESTPostAPIGuildScheduledEventJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Update a scheduled event's fields or status. */
export function editEvent(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "edit_event",
    {
      description:
        "Update a scheduled event's fields or status. Discord enforces valid lifecycle transitions.",
      inputSchema: schemas.editInput,
      outputSchema: schemas.eventOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.eventOutput, async () => {
        const { guild_id, event_id, reason, ...body } = input;
        return {
          event: await rest.patch(Routes.guildScheduledEvent(guild_id, event_id), {
            body: body satisfies RESTPatchAPIGuildScheduledEventJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Delete a scheduled Discord event.. */
export function deleteEvent(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "delete_event",
    {
      description: "Delete a scheduled Discord event.",
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
        await rest.delete(Routes.guildScheduledEvent(input.guild_id, input.event_id), {
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}
