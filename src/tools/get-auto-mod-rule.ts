import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/auto-moderation.schemas";

export const schema = schemas.ruleInput.shape;
export const outputSchema = schemas.ruleOutput.shape;
export const metadata = {
  name: "get_auto_mod_rule",
  description: "Read one auto-moderation rule.",
  annotations: {
    title: "Read an AutoMod rule",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Reading an AutoMod rule…",
    "openai/toolInvocation/invoked": "AutoMod rule read",
    "anthropic/searchHint": "inspect one Discord automatic moderation rule",
  },
} satisfies ToolMetadata;

/** Read one auto-moderation rule. */
export default function getAutoModRule(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.ruleInput, schemas.ruleOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        rule: await rest.get(Routes.guildAutoModerationRule(input.guild_id, input.rule_id), {
          signal,
        }),
      };
    },
  });
}
