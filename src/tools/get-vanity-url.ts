import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/guilds.schemas";

export const schema = schemas.guildInput.shape;
export const outputSchema = schemas.vanityOutput.shape;
export const metadata = {
  name: "get_vanity_url",
  description: "Read the guild's vanity invite code and use count.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Read the guild's vanity invite code and use count. */
export default function getVanityUrl(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.guildInput,
    schemas.vanityOutput,
    input,
    context,
    async (input, rest, signal) => {
      return await rest.get(Routes.guildVanityUrl(input.guild_id), {
        signal,
      });
    },
  );
}
