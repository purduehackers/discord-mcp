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
    title: "Create a role",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Creating a role…",
    "openai/toolInvocation/invoked": "Created role",
    "anthropic/searchHint": "create a Discord server role with permissions",
  },
} satisfies ToolMetadata;

/** Create a guild role with selected permissions and appearance. */
export default function createRole(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(schemas.createRoleInput, schemas.roleOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      const { guild_id, reason, ...body } = input;
      return {
        role: await rest.post(Routes.guildRoles(guild_id), {
          body: body satisfies RESTPostAPIGuildRoleJSONBody,
          reason,
          signal,
        }),
      };
    },
  });
}
