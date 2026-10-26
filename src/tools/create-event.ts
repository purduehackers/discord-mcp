import { Routes, type RESTPostAPIGuildScheduledEventJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/scheduled-events.schemas";

export const schema = schemas.createInput.shape;
export const outputSchema = schemas.eventOutput.shape;
export const metadata = {
  name: "create_event",
  description:
    "Create a voice, stage, or external Discord event. External events require location and end time.",
  annotations: {
    title: "Create a scheduled event",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Creating a scheduled event…",
    "openai/toolInvocation/invoked": "Created scheduled event",
    "anthropic/searchHint": "schedule a Discord voice stage or external event",
  },
} satisfies ToolMetadata;

/** Create a voice, stage, or external Discord event. */
export default function createEvent(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.createInput, schemas.eventOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      const { guild_id, reason, ...body } = input;
      return {
        event: await rest.post(Routes.guildScheduledEvents(guild_id), {
          body: body satisfies RESTPostAPIGuildScheduledEventJSONBody,
          reason,
          signal,
        }),
      };
    },
  });
}
