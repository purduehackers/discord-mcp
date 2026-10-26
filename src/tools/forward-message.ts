import {
  Routes,
  MessageFlags,
  MessageReferenceType,
  type RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.forwardInput.shape;
export const outputSchema = schemas.messageOutput.shape;
export const metadata = {
  name: "forward_message",
  description:
    "Forward a message using Discord's native snapshot and source attribution. Requires access to the source content and permission to send in the destination. Discord does not support forwarding polls, calls, or activity messages.",
  annotations: {
    title: "Forward a message",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Forwarding a message…",
    "openai/toolInvocation/invoked": "Forwarded message",
    "anthropic/searchHint":
      "forward Discord message to another channel with original snapshot attribution",
  },
} satisfies ToolMetadata;

/** Lets Discord create the immutable snapshot rather than copying message content. */
export default function forwardMessage(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.forwardInput, schemas.messageOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => ({
      message: await rest.post(Routes.channelMessages(input.channel_id), {
        body: {
          message_reference: {
            type: MessageReferenceType.Forward,
            channel_id: input.source_channel_id,
            message_id: input.message_id,
          },
          allowed_mentions: { parse: [] },
          flags: input.silent ? MessageFlags.SuppressNotifications : undefined,
        } satisfies RESTPostAPIChannelMessageJSONBody,
        signal,
      }),
    }),
  });
}
