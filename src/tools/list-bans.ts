import { makeURLSearchParams } from "@discordjs/rest";
import { Routes, type RESTGetAPIGuildBansQuery } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/members.schemas";

export const schema = schemas.banListInput.shape;
export const outputSchema = schemas.banListOutput.shape;
export const metadata = {
  name: "list_bans",
  description: "Read one page of guild bans and recorded reasons.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Read one page of guild bans and recorded reasons. */
export default function listBans(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(
    schemas.banListInput,
    schemas.banListOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { guild_id, ...query } = input;
      return {
        bans: await rest.get(Routes.guildBans(guild_id), {
          query: makeURLSearchParams<RESTGetAPIGuildBansQuery>(query),
          signal,
        }),
      };
    },
  );
}
