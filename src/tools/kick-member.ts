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
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Remove a member from a guild without banning them. */
export default function kickMember(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(
    schemas.auditedMemberInput,
    schemas.successSchema,
    input,
    context,
    async (input, rest, signal) => {
      await rest.delete(Routes.guildMember(input.guild_id, input.user_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  );
}
