import { Routes, type RESTPostAPIChannelWebhookJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/webhooks.schemas";

export const schema = schemas.createInput.shape;
export const outputSchema = schemas.webhookOutput.shape;
export const metadata = {
  name: "create_webhook",
  description:
    "Create a channel webhook and return its metadata. Manage its secret URL through Discord's integration settings.",
  annotations: {
    title: "Create a webhook",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Creating a webhook…",
    "openai/toolInvocation/invoked": "Webhook created",
    "anthropic/searchHint": "create a Discord channel webhook integration",
  },
} satisfies ToolMetadata;

/** Create a channel webhook and return its metadata. */
export default function createWebhook(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.createInput, schemas.webhookOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      const { channel_id, reason, ...body } = input;
      return {
        webhook: await rest.post(Routes.channelWebhooks(channel_id), {
          body: body satisfies RESTPostAPIChannelWebhookJSONBody,
          reason,
          signal,
        }),
      };
    },
  });
}
