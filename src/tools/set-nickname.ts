import { Routes, type RESTPatchAPIGuildMemberJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/members.schemas";

export const schema = schemas.nicknameInput.shape;
export const outputSchema = schemas.memberOutput.shape;
export const metadata = {
  name: "set_nickname",
  description: "Set a guild member's nickname. Null clears the nickname.",
  annotations: {
    title: "Set a member nickname",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Updating a member nickname…",
    "openai/toolInvocation/invoked": "Updated member nickname",
    "anthropic/searchHint": "set change clear a Discord guild member nickname",
  },
} satisfies ToolMetadata;

/** Set a guild member's nickname. */
export default function setNickname(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.nicknameInput, schemas.memberOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        member: await rest.patch(Routes.guildMember(input.guild_id, input.user_id), {
          body: { nick: input.nick } satisfies RESTPatchAPIGuildMemberJSONBody,
          reason: input.reason,
          signal,
        }),
      };
    },
  });
}
