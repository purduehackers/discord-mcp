import { Routes, type RESTPostAPIChannelThreadsJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/threads.schemas";

export const schema = schemas.createInput.shape;
export const outputSchema = schemas.threadOutput.shape;
export const metadata = {
  name: "create_thread",
  description: "Create a standalone public or private thread in a text channel.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Create a standalone public or private thread in a text channel. */
export default function createThread(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.createInput,
    schemas.threadOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { channel_id, reason, ...body } = input;
      return {
        thread: await rest.post(Routes.threads(channel_id), {
          body: body satisfies RESTPostAPIChannelThreadsJSONBody,
          reason,
          signal,
        }),
      };
    },
  );
}
