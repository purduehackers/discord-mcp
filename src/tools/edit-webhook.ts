import { Routes, type RESTPatchAPIWebhookJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/webhooks.schemas";

export const schema = schemas.editInput.shape;
export const outputSchema = schemas.webhookOutput.shape;
export const metadata = {
  name: "edit_webhook",
  description: "Update webhook name, avatar, or destination channel.",
  annotations: {
    title: "Edit a webhook",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Updating a webhook…",
    "openai/toolInvocation/invoked": "Webhook updated",
    "anthropic/searchHint": "edit Discord webhook name avatar destination channel",
  },
} satisfies ToolMetadata;

/** Update webhook name, avatar, or destination channel. */
export default function editWebhook(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.editInput, schemas.webhookOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      const { webhook_id, reason, ...body } = input;
      return {
        webhook: await rest.patch(Routes.webhook(webhook_id), {
          body: body satisfies RESTPatchAPIWebhookJSONBody,
          reason,
          signal,
        }),
      };
    },
  });
}
