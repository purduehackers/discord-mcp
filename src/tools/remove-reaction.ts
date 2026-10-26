import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.removeReactionInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "remove_reaction",
  description: "Remove a user's reaction. Use @me for the current identity.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Remove a user's reaction. */
export default function removeReaction(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.removeReactionInput,
    schemas.successSchema,
    input,
    context,
    async (input, rest, signal) => {
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
      await rest.delete(route, { signal });
      return { success: true };
    },
  );
}
