import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.messageInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "remove_all_reactions",
  description: "Remove every reaction from a message.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Remove every reaction from a message. */
export default function removeAllReactions(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.messageInput,
    schemas.successSchema,
    input,
    context,
    async (input, rest, signal) => {
      await rest.delete(Routes.channelMessageAllReactions(input.channel_id, input.message_id), {
        signal,
      });
      return { success: true };
    },
  );
}
