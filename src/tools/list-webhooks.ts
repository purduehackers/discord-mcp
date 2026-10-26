import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/webhooks.schemas";

export const schema = schemas.channelInput.shape;
export const outputSchema = schemas.webhookListOutput.shape;
export const metadata = {
  name: "list_webhooks",
  description:
    "List channel webhook metadata. Credential-bearing tokens and URLs are excluded from output.",
  annotations: {
    title: "List channel webhooks",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Listing channel webhooks…",
    "openai/toolInvocation/invoked": "Listed channel webhooks",
    "anthropic/searchHint": "list Discord webhook integrations for a channel",
  },
} satisfies ToolMetadata;

/** List channel webhook metadata. */
export default function listWebhooks(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.channelInput, schemas.webhookListOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      return {
        webhooks: await rest.get(Routes.channelWebhooks(input.channel_id), {
          signal,
        }),
      };
    },
  });
}
