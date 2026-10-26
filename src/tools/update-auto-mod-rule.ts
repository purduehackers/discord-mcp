import { Routes, type RESTPatchAPIAutoModerationRuleJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/auto-moderation.schemas";

export const schema = schemas.editInput.shape;
export const outputSchema = schemas.ruleOutput.shape;
export const metadata = {
  name: "update_auto_mod_rule",
  description:
    "Update a rule's settings, actions, or exemptions. Its trigger type cannot be changed.",
  annotations: {
    title: "Edit an AutoMod rule",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Updating an AutoMod rule…",
    "openai/toolInvocation/invoked": "Updated AutoMod rule",
    "anthropic/searchHint": "edit enable disable Discord automatic moderation rules exemptions",
  },
} satisfies ToolMetadata;

/** Update a rule's settings, actions, or exemptions. */
export default function updateAutoModRule(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.editInput, schemas.ruleOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      const { guild_id, rule_id, reason, ...body } = input;
      return {
        rule: await rest.patch(Routes.guildAutoModerationRule(guild_id, rule_id), {
          body: body satisfies RESTPatchAPIAutoModerationRuleJSONBody,
          reason,
          signal,
        }),
      };
    },
  });
}
