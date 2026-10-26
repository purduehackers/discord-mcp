import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/channels.schemas";

export const schema = schemas.deleteChannelInput.shape;
export const outputSchema = schemas.channelOutput.shape;
export const metadata = {
  name: "delete_channel",
  description: "Delete a channel and its message history, or remove a category.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Delete a channel and its message history, or remove a category. */
export default function deleteChannel(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.deleteChannelInput,
    schemas.channelOutput,
    input,
    context,
    async (input, rest, signal) => {
      return {
        channel: await rest.delete(Routes.channel(input.channel_id), {
          reason: input.reason,
          signal,
        }),
      };
    },
  );
}
