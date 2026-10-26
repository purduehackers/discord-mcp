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
    title: "List channel invites",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Listing channel invites…",
    "openai/toolInvocation/invoked": "Listed channel invites",
    "anthropic/searchHint": "list existing Discord channel invitation links",
  },
} satisfies ToolMetadata;

/** List the guild's invites and usage metadata. */
export default function listInvites(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.listInput, schemas.inviteListOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        invites: await rest.get(Routes.guildInvites(input.guild_id), {
          signal,
        }),
      };
    },
  });
}
