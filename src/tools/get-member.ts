import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/members.schemas";

export const schema = schemas.memberInput.shape;
export const outputSchema = schemas.memberOutput.shape;
export const metadata = {
  name: "get_member",
  description: "Read a guild member's profile, roles, nickname, and moderation state.",
  annotations: {
    title: "Read member details",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Reading member details…",
    "openai/toolInvocation/invoked": "Member details read",
    "anthropic/searchHint": "inspect a Discord guild member nickname roles timeout",
  },
} satisfies ToolMetadata;

/** Read a guild member's profile, roles, nickname, and moderation state. */
export default function getMember(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(schemas.memberInput, schemas.memberOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        member: await rest.get(Routes.guildMember(input.guild_id, input.user_id), {
          signal,
        }),
      };
    },
  });
}
