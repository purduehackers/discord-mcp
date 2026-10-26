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
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Update a rule's settings, actions, or exemptions. */
export default function updateAutoModRule(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.editInput,
    schemas.ruleOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { guild_id, rule_id, reason, ...body } = input;
      return {
        rule: await rest.patch(Routes.guildAutoModerationRule(guild_id, rule_id), {
          body: body satisfies RESTPatchAPIAutoModerationRuleJSONBody,
          reason,
          signal,
        }),
      };
    },
  );
}
