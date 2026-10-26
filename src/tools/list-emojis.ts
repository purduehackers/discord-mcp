import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/emojis.schemas";

export const schema = schemas.guildInput.shape;
export const outputSchema = schemas.emojiListOutput.shape;
export const metadata = {
  name: "list_emojis",
  description: "List a guild's custom emoji and role restrictions.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** List a guild's custom emoji and role restrictions. */
export default function listEmojis(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(
    schemas.guildInput,
    schemas.emojiListOutput,
    input,
    context,
    async (input, rest, signal) => {
      return {
        emojis: await rest.get(Routes.guildEmojis(input.guild_id), {
          signal,
        }),
      };
    },
  );
}
