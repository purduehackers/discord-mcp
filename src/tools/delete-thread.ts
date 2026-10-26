import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/threads.schemas";

export const schema = schemas.deleteInput.shape;
export const outputSchema = schemas.threadOutput.shape;
export const metadata = {
  name: "delete_thread",
  description: "Delete a thread and its message history.",
  annotations: {
    title: "Delete a thread",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Deleting a thread…",
    "openai/toolInvocation/invoked": "Thread deleted",
    "anthropic/searchHint": "delete a Discord thread and its message history",
  },
} satisfies ToolMetadata;

/** Delete a thread and its message history. */
export default function deleteThread(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.deleteInput, schemas.threadOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        thread: await rest.delete(Routes.channel(input.thread_id), {
          reason: input.reason,
          signal,
        }),
      };
    },
  });
}
