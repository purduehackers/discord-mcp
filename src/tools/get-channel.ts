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
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Read a channel's settings, parent, and permission overwrites. */
export default function getChannel(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(
    schemas.channelInput,
    schemas.channelOutput,
    input,
    context,
    async (input, rest, signal) => {
      return {
        channel: await rest.get(Routes.channel(input.channel_id), {
          signal,
        }),
      };
    },
  );
}
