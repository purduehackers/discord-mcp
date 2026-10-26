import { Routes, type RESTPostAPIGuildEmojiJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/emojis.schemas";

export const schema = schemas.createInput.shape;
export const outputSchema = schemas.emojiOutput.shape;
export const metadata = {
  name: "create_emoji",
  description: "Upload a custom emoji from an image data URI.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Upload a custom emoji from an image data URI. */
export default function createEmoji(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.createInput,
    schemas.emojiOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { guild_id, reason, ...body } = input;
      return {
        emoji: await rest.post(Routes.guildEmojis(guild_id), {
          body: body satisfies RESTPostAPIGuildEmojiJSONBody,
          reason,
          signal,
        }),
      };
    },
  );
}
