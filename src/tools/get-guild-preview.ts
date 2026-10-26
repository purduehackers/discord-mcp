import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/guilds.schemas";

export const schema = schemas.guildInput.shape;
export const outputSchema = schemas.guildOutput.shape;
export const metadata = {
  name: "get_guild_preview",
  description: "Read a guild's public preview and approximate counts.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Read a guild's public preview and approximate counts. */
export default function getGuildPreview(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.guildInput,
    schemas.guildOutput,
    input,
    context,
    async (input, rest, signal) => {
      return {
        guild: await rest.get(Routes.guildPreview(input.guild_id), {
          signal,
        }),
      };
    },
  );
}
