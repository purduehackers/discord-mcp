import { Routes, type RESTPatchAPIChannelJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/channels.schemas";

export const schema = schemas.editChannelInput.shape;
export const outputSchema = schemas.channelOutput.shape;
export const metadata = {
  name: "edit_channel",
  description:
    "Update selected channel settings. Pass null to clear a parent category or automatic voice region.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Update selected channel settings. */
export default function editChannel(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.editChannelInput,
    schemas.channelOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { channel_id, reason, ...body } = input;
      return {
        channel: await rest.patch(Routes.channel(channel_id), {
          body: body satisfies RESTPatchAPIChannelJSONBody,
          reason,
          signal,
        }),
      };
    },
  );
}
