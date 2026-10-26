import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/emojis.schemas";

export const schema = schemas.deleteInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "delete_emoji",
  description: "Delete a guild's custom emoji.",
  annotations: {
    title: "Delete a custom emoji",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Deleting a custom emoji…",
    "openai/toolInvocation/invoked": "Deleted custom emoji",
    "anthropic/searchHint": "delete remove a custom Discord server emoji",
  },
} satisfies ToolMetadata;

/** Delete a guild's custom emoji. */
export default function deleteEmoji(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.deleteInput, schemas.successSchema, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      await rest.delete(Routes.guildEmoji(input.guild_id, input.emoji_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  });
}
