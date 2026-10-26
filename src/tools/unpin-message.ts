import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.auditedMessageInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "unpin_message",
  description: "Unpin a channel message.",
  annotations: {
    title: "Unpin a message",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Unpinning a message…",
    "openai/toolInvocation/invoked": "Message unpinned",
    "anthropic/searchHint": "unpin remove a Discord message from channel pins",
  },
} satisfies ToolMetadata;

/** Unpin a channel message. */
export default function unpinMessage(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.auditedMessageInput, schemas.successSchema, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      await rest.delete(Routes.channelMessagesPin(input.channel_id, input.message_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  });
}
