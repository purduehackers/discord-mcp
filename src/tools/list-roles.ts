import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/roles.schemas";

export const schema = schemas.guildInput.shape;
export const outputSchema = schemas.roleListOutput.shape;
export const metadata = {
  name: "list_roles",
  description: "List guild roles, positions, and permission bitfields.",
  annotations: {
    title: "List server roles",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Listing server roles…",
    "openai/toolInvocation/invoked": "Server roles listed",
    "anthropic/searchHint": "find Discord server roles IDs and permissions",
  },
} satisfies ToolMetadata;

/** List guild roles, positions, and permission bitfields. */
export default function listRoles(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(schemas.guildInput, schemas.roleListOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        roles: await rest.get(Routes.guildRoles(input.guild_id), {
          signal,
        }),
      };
    },
  });
}
