import { Routes, type RESTPatchAPIGuildMemberJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/members.schemas";

export const schema = schemas.auditedMemberInput.shape;
export const outputSchema = schemas.memberOutput.shape;
export const metadata = {
  name: "clear_timeout",
  description: "Clear a member's communication timeout.",
  annotations: {
    title: "Clear a member timeout",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Clearing member timeout…",
    "openai/toolInvocation/invoked": "Cleared member timeout",
    "anthropic/searchHint": "remove a Discord member communication timeout",
  },
} satisfies ToolMetadata;

/** Clear a member's communication timeout. */
export default function clearTimeout(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.auditedMemberInput, schemas.memberOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        member: await rest.patch(Routes.guildMember(input.guild_id, input.user_id), {
          body: { communication_disabled_until: null } satisfies RESTPatchAPIGuildMemberJSONBody,
          reason: input.reason,
          signal,
        }),
      };
    },
  });
}
