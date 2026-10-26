import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/roles.schemas";

export const schema = schemas.roleInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "delete_role",
  description: "Delete a guild role and remove it from every member.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Delete a guild role and remove it from every member. */
export default function deleteRole(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(
    schemas.roleInput,
    schemas.successSchema,
    input,
    context,
    async (input, rest, signal) => {
      await rest.delete(Routes.guildRole(input.guild_id, input.role_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  );
}
