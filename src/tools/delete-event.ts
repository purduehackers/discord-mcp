import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/scheduled-events.schemas";

export const schema = schemas.deleteInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "delete_event",
  description: "Delete a scheduled Discord event.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Delete a scheduled Discord event. */
export default function deleteEvent(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.deleteInput,
    schemas.successSchema,
    input,
    context,
    async (input, rest, signal) => {
      await rest.delete(Routes.guildScheduledEvent(input.guild_id, input.event_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  );
}
