import { Routes, type RESTPatchAPIGuildMemberJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/members.schemas";

export const schema = schemas.timeoutInput.shape;
export const outputSchema = schemas.memberOutput.shape;
export const metadata = {
  name: "timeout_member",
  description: "Restrict a member's communication until an ISO timestamp within the next 28 days.",
  annotations: {
    title: "Time out a member",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Setting a member timeout…",
    "openai/toolInvocation/invoked": "Member timeout set",
    "anthropic/searchHint": "mute restrict Discord member communication temporarily",
  },
} satisfies ToolMetadata;

/** Restrict a member's communication until an ISO timestamp within the next 28 days. */
export default function timeoutMember(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.timeoutInput, schemas.memberOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        member: await rest.patch(Routes.guildMember(input.guild_id, input.user_id), {
          body: {
            communication_disabled_until: input.communication_disabled_until,
          } satisfies RESTPatchAPIGuildMemberJSONBody,
          reason: input.reason,
          signal,
        }),
      };
    },
  });
}
