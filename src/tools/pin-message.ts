import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.auditedMessageInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "pin_message",
  description: "Pin a channel message.",
  annotations: {
    title: "Pin a message",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Pinning a message…",
    "openai/toolInvocation/invoked": "Pinned message",
    "anthropic/searchHint": "pin a Discord channel message",
  },
} satisfies ToolMetadata;

/** Pin a channel message. */
export default function pinMessage(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(schemas.auditedMessageInput, schemas.successSchema, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      await rest.put(Routes.channelMessagesPin(input.channel_id, input.message_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  });
}
