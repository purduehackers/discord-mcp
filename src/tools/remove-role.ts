import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/roles.schemas";

export const schema = schemas.memberRoleInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "remove_role",
  description: "Remove one role from a member while preserving their other roles.",
  annotations: {
    title: "Remove a member role",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Removing a member role…",
    "openai/toolInvocation/invoked": "Member role removed",
    "anthropic/searchHint": "remove revoke one role from a Discord member",
  },
} satisfies ToolMetadata;

/** Remove one role from a member while preserving their other roles. */
export default function removeRole(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(schemas.memberRoleInput, schemas.successSchema, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      await rest.delete(Routes.guildMemberRole(input.guild_id, input.user_id, input.role_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  });
}
