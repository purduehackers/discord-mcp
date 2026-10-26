import { makeURLSearchParams } from "@discordjs/rest";
import { Routes, type RESTGetAPIGuildMembersSearchQuery } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/members.schemas";

export const schema = schemas.searchInput.shape;
export const outputSchema = schemas.memberListOutput.shape;
export const metadata = {
  name: "search_members",
  description: "Search guild members by username or nickname prefix.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Search guild members by username or nickname prefix. */
export default function searchMembers(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.searchInput,
    schemas.memberListOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { guild_id, ...query } = input;
      return {
        members: await rest.get(Routes.guildMembersSearch(guild_id), {
          query: makeURLSearchParams<RESTGetAPIGuildMembersSearchQuery>(query),
          signal,
        }),
      };
    },
  );
}
