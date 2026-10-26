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
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Remove one role from a member while preserving their other roles. */
export default function removeRole(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(
    schemas.memberRoleInput,
    schemas.successSchema,
    input,
    context,
    async (input, rest, signal) => {
      await rest.delete(Routes.guildMemberRole(input.guild_id, input.user_id, input.role_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  );
}
