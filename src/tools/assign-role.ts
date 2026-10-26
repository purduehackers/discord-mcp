import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/roles.schemas";

export const schema = schemas.memberRoleInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "assign_role",
  description: "Add a role to one member while preserving their other roles.",
  annotations: {
    title: "Assign a member role",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Assigning a role…",
    "openai/toolInvocation/invoked": "Role assigned",
    "anthropic/searchHint": "give a Discord member a role",
  },
} satisfies ToolMetadata;

/** Add a role to one member while preserving their other roles. */
export default function assignRole(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(schemas.memberRoleInput, schemas.successSchema, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      await rest.put(Routes.guildMemberRole(input.guild_id, input.user_id, input.role_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  });
}
