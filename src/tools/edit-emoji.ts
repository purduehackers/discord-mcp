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
    title: "Edit a custom emoji",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Updating a custom emoji…",
    "openai/toolInvocation/invoked": "Custom emoji updated",
    "anthropic/searchHint": "rename a Discord emoji or change its allowed roles",
  },
} satisfies ToolMetadata;

/** Change a custom emoji's name or role restrictions. */
export default function editEmoji(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(schemas.editInput, schemas.emojiOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      const { guild_id, emoji_id, reason, ...body } = input;
      return {
        emoji: await rest.patch(Routes.guildEmoji(guild_id, emoji_id), {
          body: body satisfies RESTPatchAPIGuildEmojiJSONBody,
          reason,
          signal,
        }),
      };
    },
  });
}
