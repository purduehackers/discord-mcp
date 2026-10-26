import { Routes, type RESTPatchAPIGuildEmojiJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/emojis.schemas";

export const schema = schemas.editInput.shape;
export const outputSchema = schemas.emojiOutput.shape;
export const metadata = {
  name: "edit_emoji",
  description: "Change a custom emoji's name or role restrictions.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Change a custom emoji's name or role restrictions. */
export default function editEmoji(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(
    schemas.editInput,
    schemas.emojiOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { guild_id, emoji_id, reason, ...body } = input;
      return {
        emoji: await rest.patch(Routes.guildEmoji(guild_id, emoji_id), {
          body: body satisfies RESTPatchAPIGuildEmojiJSONBody,
          reason,
          signal,
        }),
      };
    },
  );
}
