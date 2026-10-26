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
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Create a channel webhook and return its metadata. */
export default function createWebhook(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.createInput,
    schemas.webhookOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { channel_id, reason, ...body } = input;
      return {
        webhook: await rest.post(Routes.channelWebhooks(channel_id), {
          body: body satisfies RESTPostAPIChannelWebhookJSONBody,
          reason,
          signal,
        }),
      };
    },
  );
}
