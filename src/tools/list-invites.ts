import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/invites.schemas";

export const schema = schemas.listInput.shape;
export const outputSchema = schemas.inviteListOutput.shape;
export const metadata = {
  name: "list_invites",
  description: "List the guild's invites and usage metadata.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** List the guild's invites and usage metadata. */
export default function listInvites(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.listInput,
    schemas.inviteListOutput,
    input,
    context,
    async (input, rest, signal) => {
      return {
        invites: await rest.get(Routes.guildInvites(input.guild_id), {
          signal,
        }),
      };
    },
  );
}
