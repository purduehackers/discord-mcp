import { Routes, type RESTPostAPIAutoModerationRuleJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/auto-moderation.schemas";

export const schema = schemas.createInput.shape;
export const outputSchema = schemas.ruleOutput.shape;
export const metadata = {
  name: "create_auto_mod_rule",
  description:
    "Create a typed keyword, spam, preset, mention-spam, or member-profile auto-moderation rule.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Create a typed keyword, spam, preset, mention-spam, or member-profile auto-moderation rule. */
export default function createAutoModRule(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.createInput,
    schemas.ruleOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { guild_id, reason, ...body } = input;
      return {
        rule: await rest.post(Routes.guildAutoModerationRules(guild_id), {
          body: body satisfies RESTPostAPIAutoModerationRuleJSONBody,
          reason,
          signal,
        }),
      };
    },
  );
}
