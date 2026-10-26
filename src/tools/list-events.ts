import { makeURLSearchParams } from "@discordjs/rest";
import { Routes, type RESTGetAPIGuildScheduledEventsQuery } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/scheduled-events.schemas";

export const schema = schemas.listInput.shape;
export const outputSchema = schemas.eventListOutput.shape;
export const metadata = {
  name: "list_events",
  description: "List a guild's scheduled Discord events and subscriber counts.",
  annotations: {
    title: "List scheduled events",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Listing scheduled events…",
    "openai/toolInvocation/invoked": "Listed scheduled events",
    "anthropic/searchHint": "find upcoming scheduled Discord server events",
  },
} satisfies ToolMetadata;

/** List a guild's scheduled Discord events and subscriber counts. */
export default function listEvents(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(schemas.listInput, schemas.eventListOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        events: await rest.get(Routes.guildScheduledEvents(input.guild_id), {
          query: makeURLSearchParams<RESTGetAPIGuildScheduledEventsQuery>({
            with_user_count: input.with_user_count,
          }),
          signal,
        }),
      };
    },
  });
}
