import { Routes, type RESTPostAPIGuildRoleJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/roles.schemas";

export const schema = schemas.createRoleInput.shape;
export const outputSchema = schemas.roleOutput.shape;
export const metadata = {
  name: "create_role",
  description: "Create a guild role with selected permissions and appearance.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Create a guild role with selected permissions and appearance. */
export default function createRole(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(
    schemas.createRoleInput,
    schemas.roleOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { guild_id, reason, ...body } = input;
      return {
        role: await rest.post(Routes.guildRoles(guild_id), {
          body: body satisfies RESTPostAPIGuildRoleJSONBody,
          reason,
          signal,
        }),
      };
    },
  );
}
