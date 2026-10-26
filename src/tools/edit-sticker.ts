import { Routes, type RESTPatchAPIGuildStickerJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/stickers.schemas";

export const schema = schemas.editInput.shape;
export const outputSchema = schemas.stickerOutput.shape;
export const metadata = {
  name: "edit_sticker",
  description: "Change a guild sticker's name, description, or tags.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Change a guild sticker's name, description, or tags. */
export default function editSticker(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.editInput,
    schemas.stickerOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { guild_id, sticker_id, reason, ...body } = input;
      return {
        sticker: await rest.patch(Routes.guildSticker(guild_id, sticker_id), {
          body: body satisfies RESTPatchAPIGuildStickerJSONBody,
          reason,
          signal,
        }),
      };
    },
  );
}
