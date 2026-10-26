import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.messageInput.shape;
export const outputSchema = schemas.messageOutput.shape;
export const metadata = {
  name: "crosspost_message",
  description: "Publish an announcement message to following channels.",
  annotations: {
    title: "Publish an announcement",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Publishing an announcement…",
    "openai/toolInvocation/invoked": "Published announcement",
    "anthropic/searchHint": "publish crosspost a Discord announcement to following channels",
  },
} satisfies ToolMetadata;

/** Publish an announcement message to following channels. */
export default function crosspostMessage(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.messageInput, schemas.messageOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        message: await rest.post(
          Routes.channelMessageCrosspost(input.channel_id, input.message_id),
          { signal },
        ),
      };
    },
  });
}
