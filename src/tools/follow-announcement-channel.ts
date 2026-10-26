import { Routes, type RESTPostAPIChannelFollowersJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/channels.schemas";

export const schema = schemas.followInput.shape;
export const outputSchema = schemas.followOutput.shape;
export const metadata = {
  name: "follow_announcement_channel",
  description: "Follow an announcement channel into a destination channel.",
  annotations: {
    title: "Follow an announcement channel",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Following an announcement channel…",
    "openai/toolInvocation/invoked": "Followed announcement channel",
    "anthropic/searchHint": "subscribe a Discord channel to another channel announcements",
  },
} satisfies ToolMetadata;

/** Follow an announcement channel into a destination channel. */
export default function followAnnouncementChannel(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.followInput, schemas.followOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return await rest.post(Routes.channelFollowers(input.channel_id), {
        body: {
          webhook_channel_id: input.webhook_channel_id,
        } satisfies RESTPostAPIChannelFollowersJSONBody,
        reason: input.reason,
        signal,
      });
    },
  });
}
