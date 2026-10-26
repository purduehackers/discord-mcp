import { Routes, type RESTPatchAPIGuildScheduledEventJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/scheduled-events.schemas";

export const schema = schemas.editInput.shape;
export const outputSchema = schemas.eventOutput.shape;
export const metadata = {
  name: "edit_event",
  description:
    "Update a scheduled event's fields or status. Discord enforces valid lifecycle transitions.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Update a scheduled event's fields or status. */
export default function editEvent(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(
    schemas.editInput,
    schemas.eventOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { guild_id, event_id, reason, ...body } = input;
      return {
        event: await rest.patch(Routes.guildScheduledEvent(guild_id, event_id), {
          body: body satisfies RESTPatchAPIGuildScheduledEventJSONBody,
          reason,
          signal,
        }),
      };
    },
  );
}
