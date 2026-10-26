import { Result } from "better-result";
import {
  Routes,
  MessageFlags,
  type RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";
import type { z } from "zod";

import { discordCall, discordRequest } from "../lib/discord";
import { DiscordError } from "../lib/errors";
import * as schemas from "../lib/schemas/messages.schemas";
import { splitMessage } from "../lib/split-message";

export const schema = schemas.longMessageInput.shape;
export const outputSchema = schemas.longMessageOutput.shape;
export const metadata = {
  name: "send_long_message",
  description:
    "Split text into at most 20 messages of 2,000 characters, preserving Unicode and fenced code. Sends sequentially and stops on failure. Errors report sent IDs and the next chunk index. Inspect uncertain delivery before resuming with identical content. Mentions are disabled by default.",
  annotations: {
    title: "Send a long message",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Sending a long message…",
    "openai/toolInvocation/invoked": "Sent long message",
    "anthropic/searchHint":
      "send long Discord text split multiple messages preserve code blocks fences",
  },
} satisfies ToolMetadata;

/** Records confirmed sends so a later failure does not hide partial delivery. */
export default function sendLongMessage(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.longMessageInput, schemas.longMessageOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    workflow: (input, rest, signal) =>
      Result.gen(async function* () {
        const chunks = yield* splitMessage(input.content, input.max_chunks);
        if (input.start_chunk_index >= chunks.length)
          return Result.err(
            new DiscordError({
              message: "start_chunk_index is outside the split message.",
              hint: "Use the original content and the next_chunk_index returned by the failed send.",
            }),
          );
        const sent: z.output<typeof schemas.longMessageOutput>["sent_messages"] = [];
        for (let index = input.start_chunk_index; index < chunks.length; index += 1) {
          const result = await discordCall(schemas.sentMessageSchema, () =>
            rest.post(Routes.channelMessages(input.channel_id), {
              body: {
                content: chunks[index],
                allowed_mentions: input.allowed_mentions,
                flags: input.silent ? MessageFlags.SuppressNotifications : undefined,
              } satisfies RESTPostAPIChannelMessageJSONBody,
              signal,
            }),
          );
          if (result.isErr())
            return Result.err(
              new DiscordError({
                ...result.error.diagnostic(),
                message: `Stopped after ${sent.length} confirmed sends in this call. ${result.error.message}`,
                hint: `${result.error.hint ?? ""} Do not resend confirmed chunks. Inspect the next chunk in channel history if delivery_uncertain is true, then resume with identical content and start_chunk_index.`,
                progress: {
                  sent_messages: sent,
                  next_chunk_index: index,
                  total_chunks: chunks.length,
                  delivery_uncertain:
                    result.error.status === undefined || result.error.status >= 500,
                },
              }),
            );
          sent.push({ ...result.value, chunk_index: index });
        }
        return Result.ok({ sent_messages: sent, total_chunks: chunks.length });
      }),
  });
}
