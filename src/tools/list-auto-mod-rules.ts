import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/auto-moderation.schemas";

export const schema = schemas.guildInput.shape;
export const outputSchema = schemas.ruleListOutput.shape;
export const metadata = {
  name: "list_auto_mod_rules",
  description: "List a guild's auto-moderation rules, actions, and exemptions.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** List a guild's auto-moderation rules, actions, and exemptions. */
export default function listAutoModRules(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.guildInput,
    schemas.ruleListOutput,
    input,
    context,
    async (input, rest, signal) => {
      return {
        rules: await rest.get(Routes.guildAutoModerationRules(input.guild_id), {
          signal,
        }),
      };
    },
  );
}
