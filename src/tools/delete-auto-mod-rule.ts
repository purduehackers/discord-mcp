import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/auto-moderation.schemas";

export const schema = schemas.deleteInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "delete_auto_mod_rule",
  description: "Delete an auto-moderation rule and its protection.",
  annotations: {
    title: "Delete an AutoMod rule",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Deleting an AutoMod rule…",
    "openai/toolInvocation/invoked": "Deleted AutoMod rule",
    "anthropic/searchHint": "delete remove a Discord automatic moderation rule",
  },
} satisfies ToolMetadata;

/** Delete an auto-moderation rule and its protection. */
export default function deleteAutoModRule(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.deleteInput, schemas.successSchema, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      await rest.delete(Routes.guildAutoModerationRule(input.guild_id, input.rule_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  });
}
