import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/invites.schemas";

export const schema = schemas.deleteInput.shape;
export const outputSchema = schemas.inviteOutput.shape;
export const metadata = {
  name: "delete_invite",
  description: "Revoke an invite code for everyone who has it.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Revoke an invite code for everyone who has it. */
export default function deleteInvite(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.deleteInput,
    schemas.inviteOutput,
    input,
    context,
    async (input, rest, signal) => {
      return {
        invite: await rest.delete(Routes.invite(input.code), {
          reason: input.reason,
          signal,
        }),
      };
    },
  );
}
