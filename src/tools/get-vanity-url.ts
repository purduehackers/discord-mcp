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
    title: "Read a server vanity URL",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Reading the server vanity URL…",
    "openai/toolInvocation/invoked": "Read server vanity URL",
    "anthropic/searchHint": "find a Discord server custom invitation vanity URL",
  },
} satisfies ToolMetadata;

/** Read the guild's vanity invite code and use count. */
export default function getVanityUrl(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.guildInput, schemas.vanityOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return await rest.get(Routes.guildVanityUrl(input.guild_id), {
        signal,
      });
    },
  });
}
