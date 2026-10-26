import { Locale, type APIGuild, type APIGuildPreview } from "discord-api-types/v10";
import { z } from "zod";

import { imageSchema, reasonSchema, snowflakeSchema } from "../../schemas";
export const guildInput = z.strictObject({ guild_id: snowflakeSchema });
export const guildSchema = z
  .strictObject({
    id: snowflakeSchema,
    name: z.string(),
    icon: z.string().nullable(),
    description: z.string().nullable(),
    features: z.array(z.string()),
    owner_id: snowflakeSchema.optional(),
    approximate_member_count: z.int().optional(),
    approximate_presence_count: z.int().optional(),
    verification_level: z.int().optional(),
    default_message_notifications: z.int().optional(),
    explicit_content_filter: z.int().optional(),
    preferred_locale: z.enum(Locale).optional(),
    system_channel_id: snowflakeSchema.nullable().optional(),
    rules_channel_id: snowflakeSchema.nullable().optional(),
    public_updates_channel_id: snowflakeSchema.nullable().optional(),
  })
  .strip() satisfies z.ZodType<
  Pick<APIGuild | APIGuildPreview, "id" | "name" | "icon" | "description">
>;
export const guildOutput = z.strictObject({ guild: guildSchema });
export const vanityOutput = z.strictObject({ code: z.string().nullable(), uses: z.int() });
export const updateGuildInput = z.strictObject({
  guild_id: snowflakeSchema,
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().max(1000).nullable().optional(),
  icon: imageSchema.nullable().optional(),
  banner: imageSchema.nullable().optional(),
  splash: imageSchema.nullable().optional(),
  discovery_splash: imageSchema.nullable().optional(),
  verification_level: z.literal([0, 1, 2, 3, 4]).optional(),
  default_message_notifications: z.literal([0, 1]).optional(),
  explicit_content_filter: z.literal([0, 1, 2]).optional(),
  afk_channel_id: snowflakeSchema.nullable().optional(),
  afk_timeout: z.literal([60, 300, 900, 1800, 3600]).optional(),
  system_channel_id: snowflakeSchema.nullable().optional(),
  system_channel_flags: z.int().min(0).max(63).optional(),
  rules_channel_id: snowflakeSchema.nullable().optional(),
  public_updates_channel_id: snowflakeSchema.nullable().optional(),
  preferred_locale: z.enum(Locale).optional(),
  premium_progress_bar_enabled: z.boolean().optional(),
  reason: reasonSchema,
});
