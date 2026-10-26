import { Routes, type RESTPatchAPIGuildJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/guilds.schemas";

export const schema = schemas.updateGuildInput.shape;
export const outputSchema = schemas.guildOutput.shape;
export const metadata = {
  name: "update_guild",
  description: "Update selected guild settings. Null clears supported artwork or channel fields.",
  annotations: {
    title: "Edit server settings",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Updating server settings…",
    "openai/toolInvocation/invoked": "Server settings updated",
    "anthropic/searchHint": "edit Discord guild server name artwork settings channels",
  },
} satisfies ToolMetadata;

/** Update selected guild settings. */
export default function updateGuild(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.updateGuildInput, schemas.guildOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      const { guild_id, reason, ...body } = input;
      return {
        guild: await rest.patch(Routes.guild(guild_id), {
          body: body satisfies RESTPatchAPIGuildJSONBody,
          reason,
          signal,
        }),
      };
    },
  });
}
