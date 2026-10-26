import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/stickers.schemas";

export const schema = schemas.guildInput.shape;
export const outputSchema = schemas.stickerListOutput.shape;
export const metadata = {
  name: "list_stickers",
  description: "List a guild's stickers and formats.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** List a guild's stickers and formats. */
export default function listStickers(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.guildInput,
    schemas.stickerListOutput,
    input,
    context,
    async (input, rest, signal) => {
      return {
        stickers: await rest.get(Routes.guildStickers(input.guild_id), {
          signal,
        }),
      };
    },
  );
}
