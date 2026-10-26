import { Result } from "better-result";
import {
  Routes,
  MessageFlags,
  type RESTPostAPICurrentUserCreateDMChannelJSONBody,
  type RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordCall, discordRequest } from "../lib/discord";
import { channelSchema } from "../lib/schemas/channels.schemas";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.directMessageInput.shape;
export const outputSchema = schemas.messageOutput.shape;
export const metadata = {
  name: "send_direct_message",
  description:
    "Send a text DM to one user, opening or reusing their DM channel. Send only when the user requests it. Mentions are disabled by default.",
  annotations: {
    title: "Send a direct message",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Sending a direct message…",
    "openai/toolInvocation/invoked": "Sent direct message",
    "anthropic/searchHint": "send Discord private direct message DM to a user",
  },
} satisfies ToolMetadata;

/** Reuses Discord's DM channel before sending the requested message. */
export default function sendDirectMessage(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.directMessageInput, schemas.messageOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    workflow: (input, rest, signal) =>
      Result.gen(async function* () {
        const channel = yield* Result.await(
          discordCall(channelSchema, () =>
            rest.post(Routes.userChannels(), {
              body: {
                recipient_id: input.recipient_id,
              } satisfies RESTPostAPICurrentUserCreateDMChannelJSONBody,
              signal,
            }),
          ),
        );
        const message = yield* Result.await(
          discordCall(schemas.messageSchema, () =>
            rest.post(Routes.channelMessages(channel.id), {
              body: {
                content: input.content,
                allowed_mentions: input.allowed_mentions,
                flags: input.silent ? MessageFlags.SuppressNotifications : undefined,
              } satisfies RESTPostAPIChannelMessageJSONBody,
              signal,
            }),
          ),
        );
        return Result.ok({ message });
      }),
  });
}
