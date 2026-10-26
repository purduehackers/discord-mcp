import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/channels.schemas";

export const schema = schemas.channelInput.shape;
export const outputSchema = schemas.channelOutput.shape;
export const metadata = {
  name: "get_channel",
  description: "Read a channel's settings, parent, and permission overwrites.",
  annotations: {
    title: "Read channel details",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Reading channel details…",
    "openai/toolInvocation/invoked": "Read channel details",
    "anthropic/searchHint": "inspect Discord channel type topic settings permissions by ID",
  },
} satisfies ToolMetadata;

/** Read a channel's settings, parent, and permission overwrites. */
export default function getChannel(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(schemas.channelInput, schemas.channelOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        channel: await rest.get(Routes.channel(input.channel_id), {
          signal,
        }),
      };
    },
  });
}
