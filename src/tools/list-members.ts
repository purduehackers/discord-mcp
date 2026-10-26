import { makeURLSearchParams } from "@discordjs/rest";
import { Routes, type RESTGetAPIGuildMembersQuery } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/members.schemas";

export const schema = schemas.listInput.shape;
export const outputSchema = schemas.memberListOutput.shape;
export const metadata = {
  name: "list_members",
  description:
    "Read one page of guild members. Requires the members intent; use the last user ID as after.",
  annotations: {
    title: "List server members",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Listing server members…",
    "openai/toolInvocation/invoked": "Listed server members",
    "anthropic/searchHint": "list Discord guild server members with pagination",
  },
} satisfies ToolMetadata;

/** Read one page of guild members. */
export default function listMembers(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.listInput, schemas.memberListOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      const { guild_id, ...query } = input;
      return {
        members: await rest.get(Routes.guildMembers(guild_id), {
          query: makeURLSearchParams<RESTGetAPIGuildMembersQuery>(query),
          signal,
        }),
      };
    },
  });
}
