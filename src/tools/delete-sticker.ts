import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/stickers.schemas";

export const schema = schemas.deleteInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "delete_sticker",
  description: "Delete a guild sticker.",
  annotations: {
    title: "Delete a sticker",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Deleting a sticker…",
    "openai/toolInvocation/invoked": "Sticker deleted",
    "anthropic/searchHint": "delete remove a custom Discord server sticker",
  },
} satisfies ToolMetadata;

/** Delete a guild sticker. */
export default function deleteSticker(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.deleteInput, schemas.successSchema, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      await rest.delete(Routes.guildSticker(input.guild_id, input.sticker_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  });
}
