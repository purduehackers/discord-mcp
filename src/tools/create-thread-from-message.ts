import { Routes, type RESTPostAPIChannelMessagesThreadsJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/threads.schemas";

export const schema = schemas.fromMessageInput.shape;
export const outputSchema = schemas.threadOutput.shape;
export const metadata = {
  name: "create_thread_from_message",
  description: "Start a thread attached to an existing channel message.",
  annotations: {
    title: "Start a thread from a message",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Starting a message thread…",
    "openai/toolInvocation/invoked": "Started message thread",
    "anthropic/searchHint": "start a Discord reply thread on an existing message",
  },
} satisfies ToolMetadata;

/** Start a thread attached to an existing channel message. */
export default function createThreadFromMessage(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.fromMessageInput, schemas.threadOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      const { channel_id, message_id, reason, ...body } = input;
      return {
        thread: await rest.post(Routes.threads(channel_id, message_id), {
          body: body satisfies RESTPostAPIChannelMessagesThreadsJSONBody,
          reason,
          signal,
        }),
      };
    },
  });
}
