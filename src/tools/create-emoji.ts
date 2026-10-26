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
    title: "Upload a custom emoji",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Uploading a custom emoji…",
    "openai/toolInvocation/invoked": "Custom emoji uploaded",
    "anthropic/searchHint": "upload add a custom Discord server emoji",
  },
} satisfies ToolMetadata;

/** Upload a custom emoji from an image data URI. */
export default function createEmoji(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.createInput, schemas.emojiOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      const { guild_id, reason, ...body } = input;
      return {
        emoji: await rest.post(Routes.guildEmojis(guild_id), {
          body: body satisfies RESTPostAPIGuildEmojiJSONBody,
          reason,
          signal,
        }),
      };
    },
  });
}
