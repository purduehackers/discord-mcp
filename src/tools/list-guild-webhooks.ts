import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/webhooks.schemas";

export const schema = schemas.guildInput.shape;
export const outputSchema = schemas.webhookListOutput.shape;
export const metadata = {
  name: "list_guild_webhooks",
  description: "List webhook metadata across all channels in a guild.",
  annotations: {
    title: "List server webhooks",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Listing server webhooks…",
    "openai/toolInvocation/invoked": "Listed server webhooks",
    "anthropic/searchHint": "list Discord webhook integrations across a guild server",
  },
} satisfies ToolMetadata;

/** Lists guild webhooks without exposing their credential-bearing fields. */
export default function listGuildWebhooks(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.guildInput, schemas.webhookListOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => ({
      webhooks: await rest.get(Routes.guildWebhooks(input.guild_id), {
        signal,
      }),
    }),
  });
}
