import { makeURLSearchParams } from "@discordjs/rest";
import { Routes, type RESTGetAPIChannelMessagesQuery } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.fetchInput.shape;
export const outputSchema = schemas.messageListOutput.shape;
export const metadata = {
  name: "fetch_messages",
  description:
    "Read one page of channel messages. Use a returned message ID as before or after to paginate.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Read one page of channel messages. */
export default function fetchMessages(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.fetchInput,
    schemas.messageListOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { channel_id, ...query } = input;
      return {
        messages: await rest.get(Routes.channelMessages(channel_id), {
          query: makeURLSearchParams<RESTGetAPIChannelMessagesQuery>(query),
          signal,
        }),
      };
    },
  );
}
