import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/channels.schemas";

export const schema = schemas.guildInput.shape;
export const outputSchema = schemas.channelListOutput.shape;
export const metadata = {
  name: "list_channels",
  description:
    "List a guild's channels and categories. Active threads are available through list_threads.",
  annotations: {
    title: "List server channels",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Listing server channels…",
    "openai/toolInvocation/invoked": "Listed server channels",
    "anthropic/searchHint": "find Discord guild channels and categories by name or ID",
  },
} satisfies ToolMetadata;

/** List a guild's channels and categories. */
export default function listChannels(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.guildInput, schemas.channelListOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        channels: await rest.get(Routes.guildChannels(input.guild_id), {
          signal,
        }),
      };
    },
  });
}
