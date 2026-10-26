import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/members.schemas";

export const schema = schemas.auditedMemberInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "kick_member",
  description: "Remove a member from a guild without banning them.",
  annotations: {
    title: "Kick a member",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Kicking a member…",
    "openai/toolInvocation/invoked": "Kicked member",
    "anthropic/searchHint": "kick remove a Discord member from a server",
  },
} satisfies ToolMetadata;

/** Remove a member from a guild without banning them. */
export default function kickMember(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(schemas.auditedMemberInput, schemas.successSchema, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      await rest.delete(Routes.guildMember(input.guild_id, input.user_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  });
}
