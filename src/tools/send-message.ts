import {
  Routes,
  MessageFlags,
  type RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.sendInput.shape;
export const outputSchema = schemas.messageOutput.shape;
export const metadata = {
  name: "send_message",
  description:
    "Send a message with optional embeds, files, and a reply reference. Mentions are disabled unless explicitly selected.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Send a message with optional embeds, files, and a reply reference. */
export default function sendMessage(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.sendInput,
    schemas.messageOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { channel_id, files, suppress_embeds, silent, ...body } = input;
      const flags =
        (suppress_embeds ? MessageFlags.SuppressEmbeds : 0) |
        (silent ? MessageFlags.SuppressNotifications : 0);
      return {
        message: await rest.post(Routes.channelMessages(channel_id), {
          body: { ...body, flags } satisfies RESTPostAPIChannelMessageJSONBody,
          files: files?.map((file) => ({
            name: file.name,
            data: Buffer.from(file.data, "base64"),
            contentType: file.content_type,
          })),
          signal,
        }),
      };
    },
  );
}
