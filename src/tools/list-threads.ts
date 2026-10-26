import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/threads.schemas";

export const schema = schemas.guildInput.shape;
export const outputSchema = schemas.threadListOutput.shape;
export const metadata = {
  name: "list_threads",
  description: "List all active threads visible to the current identity in a guild.",
  annotations: {
    title: "List active threads",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Listing active threads…",
    "openai/toolInvocation/invoked": "Active threads listed",
    "anthropic/searchHint": "find active Discord server threads",
  },
} satisfies ToolMetadata;

/** List all active threads visible to the current identity in a guild. */
export default function listThreads(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.guildInput, schemas.threadListOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return await rest.get(Routes.guildActiveThreads(input.guild_id), {
        signal,
      });
    },
  });
}
