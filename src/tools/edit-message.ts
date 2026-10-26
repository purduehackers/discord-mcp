import { Routes, type RESTPatchAPIChannelMessageJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.editInput.shape;
export const outputSchema = schemas.messageOutput.shape;
export const metadata = {
  name: "edit_message",
  description:
    "Edit a message authored by the current identity. Empty content or embeds explicitly clears that field.",
  annotations: {
    title: "Edit a message",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Updating a message…",
    "openai/toolInvocation/invoked": "Message updated",
    "anthropic/searchHint": "edit update an existing Discord message content embeds attachments",
  },
} satisfies ToolMetadata;

/** Edit a message authored by the current identity. */
export default function editMessage(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.editInput, schemas.messageOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      const { channel_id, message_id, ...body } = input;
      return {
        message: await rest.patch(Routes.channelMessage(channel_id, message_id), {
          body: body satisfies RESTPatchAPIChannelMessageJSONBody,
          signal,
        }),
      };
    },
  });
}
