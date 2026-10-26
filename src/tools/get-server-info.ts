import { makeURLSearchParams } from "@discordjs/rest";
import { Routes, type RESTGetAPIGuildQuery } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/guilds.schemas";

export const schema = schemas.guildInput.shape;
export const outputSchema = schemas.guildOutput.shape;
export const metadata = {
  name: "get_server_info",
  description: "Read guild settings and approximate member and presence counts.",
  annotations: {
    title: "Read server details",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Reading server details…",
    "openai/toolInvocation/invoked": "Server details read",
    "anthropic/searchHint": "inspect Discord guild server settings counts features",
  },
} satisfies ToolMetadata;

/** Read guild settings and approximate member and presence counts. */
export default function getServerInfo(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.guildInput, schemas.guildOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        guild: await rest.get(Routes.guild(input.guild_id), {
          query: makeURLSearchParams<RESTGetAPIGuildQuery>({ with_counts: true }),
          signal,
        }),
      };
    },
  });
}
