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
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Read one auto-moderation rule. */
export default function getAutoModRule(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.ruleInput,
    schemas.ruleOutput,
    input,
    context,
    async (input, rest, signal) => {
      return {
        rule: await rest.get(Routes.guildAutoModerationRule(input.guild_id, input.rule_id), {
          signal,
        }),
      };
    },
  );
}
