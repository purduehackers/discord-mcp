import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.auditedMessageInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "delete_message",
  description: "Delete one channel message.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Delete one channel message. */
export default function deleteMessage(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.auditedMessageInput,
    schemas.successSchema,
    input,
    context,
    async (input, rest, signal) => {
      await rest.delete(Routes.channelMessage(input.channel_id, input.message_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  );
}
