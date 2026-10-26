import { Routes, type RESTPatchAPIGuildRoleJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/roles.schemas";

export const schema = schemas.editRoleInput.shape;
export const outputSchema = schemas.roleOutput.shape;
export const metadata = {
  name: "edit_role",
  description: "Edit selected fields on a guild role.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Edit selected fields on a guild role. */
export default function editRole(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(
    schemas.editRoleInput,
    schemas.roleOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { guild_id, role_id, reason, ...body } = input;
      return {
        role: await rest.patch(Routes.guildRole(guild_id, role_id), {
          body: body satisfies RESTPatchAPIGuildRoleJSONBody,
          reason,
          signal,
        }),
      };
    },
  );
}
