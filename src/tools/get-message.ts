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
    title: "Read a message",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Reading a message…",
    "openai/toolInvocation/invoked": "Message read",
    "anthropic/searchHint": "fetch one Discord message by channel and message ID",
  },
} satisfies ToolMetadata;

/** Read one message, including embeds, attachments, and reply references. */
export default function getMessage(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(schemas.messageInput, schemas.messageOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        message: await rest.get(Routes.channelMessage(input.channel_id, input.message_id), {
          signal,
        }),
      };
    },
  });
}
