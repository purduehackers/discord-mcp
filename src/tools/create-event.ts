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
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Create a voice, stage, or external Discord event. */
export default function createEvent(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.createInput,
    schemas.eventOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { guild_id, reason, ...body } = input;
      return {
        event: await rest.post(Routes.guildScheduledEvents(guild_id), {
          body: body satisfies RESTPostAPIGuildScheduledEventJSONBody,
          reason,
          signal,
        }),
      };
    },
  );
}
