import { WebhookType, type APIWebhook } from "discord-api-types/v10";
import { z } from "zod";

import { imageSchema, reasonSchema, snowflakeSchema, successSchema } from "../schemas";
export { successSchema };
export const webhookSchema = z
  .strictObject({
    id: snowflakeSchema,
    type: z.enum(WebhookType),
    guild_id: snowflakeSchema.optional(),
    channel_id: snowflakeSchema.nullable(),
    name: z.string().nullable(),
    avatar: z.string().nullable(),
    application_id: snowflakeSchema.nullable(),
  })
  .strip() satisfies z.ZodType<
  Pick<APIWebhook, "id" | "type" | "guild_id" | "channel_id" | "name" | "avatar" | "application_id">
>;
export const channelInput = z.strictObject({ channel_id: snowflakeSchema });
export const guildInput = z.strictObject({ guild_id: snowflakeSchema });
export const webhookOutput = z.strictObject({ webhook: webhookSchema });
export const webhookListOutput = z.strictObject({ webhooks: z.array(webhookSchema) });
export const createInput = z.strictObject({
  channel_id: snowflakeSchema,
  name: z.string().trim().min(1).max(80),
  avatar: imageSchema.nullable().optional(),
  reason: reasonSchema,
});
export const editInput = z.strictObject({
  webhook_id: snowflakeSchema,
  name: z.string().trim().min(1).max(80).optional(),
  avatar: imageSchema.nullable().optional(),
  channel_id: snowflakeSchema.optional(),
  reason: reasonSchema,
});
export const deleteInput = z.strictObject({ webhook_id: snowflakeSchema, reason: reasonSchema });
