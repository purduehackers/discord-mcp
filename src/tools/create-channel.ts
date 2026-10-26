import { Routes, type RESTPostAPIGuildChannelJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/channels.schemas";

export const schema = schemas.createChannelInput.shape;
export const outputSchema = schemas.channelOutput.shape;
export const metadata = {
  name: "create_channel",
  description: "Create a guild channel or category with typed Discord settings.",
  annotations: {
    title: "Create a channel",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Creating a channel…",
    "openai/toolInvocation/invoked": "Created channel",
    "anthropic/searchHint": "create a Discord server channel or category",
  },
} satisfies ToolMetadata;

/** Create a guild channel or category with typed Discord settings. */
export default function createChannel(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.createChannelInput, schemas.channelOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      const { guild_id, reason, ...body } = input;
      return {
        channel: await rest.post(Routes.guildChannels(guild_id), {
          body: body satisfies RESTPostAPIGuildChannelJSONBody,
          reason,
          signal,
        }),
      };
    },
  });
}
