import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/messages.schemas";

export const schema = schemas.reactionInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "add_reaction",
  description: "Add the current identity's reaction to a message.",
  annotations: {
    title: "Add a reaction",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Adding a reaction…",
    "openai/toolInvocation/invoked": "Reaction added",
    "anthropic/searchHint": "react to a Discord message with emoji",
  },
} satisfies ToolMetadata;

/** Add the current identity's reaction to a message. */
export default function addReaction(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.reactionInput, schemas.successSchema, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      await rest.put(
        Routes.channelMessageOwnReaction(
          input.channel_id,
          input.message_id,
          encodeURIComponent(input.emoji),
        ),
        { signal },
      );
      return { success: true };
    },
  });
}
