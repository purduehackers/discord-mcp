import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.messageInput.shape;
export const outputSchema = schemas.messageOutput.shape;
export const metadata = {
  name: "get_message",
  description: "Read one message, including embeds, attachments, and reply references.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Read one message, including embeds, attachments, and reply references. */
export default function getMessage(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(
    schemas.messageInput,
    schemas.messageOutput,
    input,
    context,
    async (input, rest, signal) => {
      return {
        message: await rest.get(Routes.channelMessage(input.channel_id, input.message_id), {
          signal,
        }),
      };
    },
  );
}
