import { Routes, type RESTPostAPIChannelMessagesBulkDeleteJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.bulkDeleteInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "bulk_delete_messages",
  description:
    "Delete 2–100 distinct messages less than 14 days old. Discord rejects older messages.",
  annotations: {
    title: "Delete multiple messages",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Deleting messages…",
    "openai/toolInvocation/invoked": "Deleted messages",
    "anthropic/searchHint": "bulk delete recent Discord channel messages",
  },
} satisfies ToolMetadata;

/** Delete 2–100 distinct messages less than 14 days old. */
export default function bulkDeleteMessages(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.bulkDeleteInput, schemas.successSchema, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      await rest.post(Routes.channelBulkDelete(input.channel_id), {
        body: { messages: input.messages } satisfies RESTPostAPIChannelMessagesBulkDeleteJSONBody,
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  });
}
