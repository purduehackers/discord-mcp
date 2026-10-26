import { Routes, type RESTPostAPIChannelInviteJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/invites.schemas";

export const schema = schemas.createInput.shape;
export const outputSchema = schemas.inviteOutput.shape;
export const metadata = {
  name: "create_invite",
  description:
    "Create a channel invite. The returned code forms https://discord.gg/<code>; max_age 0 makes it permanent.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Create a channel invite. */
export default function createInvite(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.createInput,
    schemas.inviteOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { channel_id, reason, ...body } = input;
      return {
        invite: await rest.post(Routes.channelInvites(channel_id), {
          body: body satisfies RESTPostAPIChannelInviteJSONBody,
          reason,
          signal,
        }),
      };
    },
  );
}
