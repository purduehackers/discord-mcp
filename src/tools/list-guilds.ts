import { makeURLSearchParams } from "@discordjs/rest";
import { Routes, type RESTGetAPICurrentUserGuildsQuery } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/users.schemas";

export const schema = schemas.guildListInput.shape;
export const outputSchema = schemas.guildListOutput.shape;
export const metadata = {
  name: "list_guilds",
  description:
    "List one page of guilds accessible to the current identity. Use a returned guild ID as the next after cursor.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** List one page of guilds accessible to the current identity. */
export default function listGuilds(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(
    schemas.guildListInput,
    schemas.guildListOutput,
    input,
    context,
    async (input, rest, signal) => {
      return {
        guilds: await rest.get(Routes.userGuilds(), {
          query: makeURLSearchParams<RESTGetAPICurrentUserGuildsQuery>(input),
          signal,
        }),
      };
    },
  );
}
