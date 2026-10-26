import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/members.schemas";

export const schema = schemas.auditedMemberInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "unban_member",
  description: "Remove a guild ban without adding the user back to the guild.",
  annotations: {
    title: "Unban a member",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Removing a member ban…",
    "openai/toolInvocation/invoked": "Unbanned member",
    "anthropic/searchHint": "unban forgive remove a Discord server user ban",
  },
} satisfies ToolMetadata;

/** Remove a guild ban without adding the user back to the guild. */
export default function unbanMember(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.auditedMemberInput, schemas.successSchema, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      await rest.delete(Routes.guildBan(input.guild_id, input.user_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  });
}
