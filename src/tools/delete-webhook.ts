import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/webhooks.schemas";

export const schema = schemas.deleteInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "delete_webhook",
  description: "Delete a webhook and invalidate its integration URL.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Delete a webhook and invalidate its integration URL. */
export default function deleteWebhook(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.deleteInput,
    schemas.successSchema,
    input,
    context,
    async (input, rest, signal) => {
      await rest.delete(Routes.webhook(input.webhook_id), {
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  );
}
