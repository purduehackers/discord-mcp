/** @fileoverview Channel schemas constrain creation fields and preserve explicit clearing values. */
import { ChannelType, type APIChannel } from "discord-api-types/v10";
import { z } from "zod";

import { permissionsSchema, reasonSchema, snowflakeSchema } from "../schemas";

export const overwriteSchema = z.strictObject({
  id: snowflakeSchema,
  type: z.literal([0, 1]),
  allow: permissionsSchema,
  deny: permissionsSchema,
});
export const channelSchema = z
  .strictObject({
    id: snowflakeSchema,
    type: z.literal([
      ChannelType.GuildText,
      ChannelType.DM,
      ChannelType.GuildVoice,
      ChannelType.GroupDM,
      ChannelType.GuildCategory,
      ChannelType.GuildAnnouncement,
      ChannelType.AnnouncementThread,
      ChannelType.PublicThread,
      ChannelType.PrivateThread,
      ChannelType.GuildStageVoice,
      ChannelType.GuildForum,
      ChannelType.GuildMedia,
    ]),
    guild_id: snowflakeSchema.optional(),
    name: z.string().nullable().optional(),
    topic: z.string().nullable().optional(),
    parent_id: snowflakeSchema.nullable().optional(),
    nsfw: z.boolean().optional(),
    position: z.int().optional(),
    bitrate: z.int().optional(),
    user_limit: z.int().optional(),
    rate_limit_per_user: z.int().optional(),
    permission_overwrites: z.array(overwriteSchema).optional(),
    thread_metadata: z
      .strictObject({
        archived: z.boolean(),
        auto_archive_duration: z.int(),
        archive_timestamp: z.string(),
        locked: z.boolean(),
        invitable: z.boolean().optional(),
      })
      .strip()
      .optional(),
  })
  .strip() satisfies z.ZodType<Pick<APIChannel, "id" | "type">>;
export const channelInput = z.strictObject({ channel_id: snowflakeSchema });
export const guildInput = z.strictObject({ guild_id: snowflakeSchema });
export const channelOutput = z.strictObject({ channel: channelSchema });
export const channelListOutput = z.strictObject({ channels: z.array(channelSchema) });
export const createChannelInput = z
  .strictObject({
    guild_id: snowflakeSchema,
    name: z.string().trim().min(1).max(100),
    type: z
      .literal([0, 2, 4, 5, 13, 15, 16])
      .default(0)
      .describe("0 text, 2 voice, 4 category, 5 announcement, 13 stage, 15 forum, 16 media."),
    topic: z.string().max(4096).optional(),
    parent_id: snowflakeSchema.nullable().optional(),
    nsfw: z.boolean().optional(),
    position: z.int().min(0).optional(),
    bitrate: z.int().min(8000).max(512_000).optional(),
    user_limit: z.int().min(0).max(99).optional(),
    rate_limit_per_user: z.int().min(0).max(21_600).optional(),
    rtc_region: z.string().nullable().optional(),
    video_quality_mode: z.literal([1, 2]).optional(),
    default_auto_archive_duration: z.literal([60, 1440, 4320, 10_080]).optional(),
    default_thread_rate_limit_per_user: z.int().min(0).max(21_600).optional(),
    permission_overwrites: z.array(overwriteSchema).optional(),
    reason: reasonSchema,
  })
  .refine(
    (input) =>
      !input.topic || input.topic.length <= (input.type === 15 || input.type === 16 ? 4096 : 1024),
    {
      path: ["topic"],
      message: "Non-forum channel topics are limited to 1024 characters.",
    },
  );
export const editChannelInput = z.strictObject({
  channel_id: snowflakeSchema,
  name: z.string().trim().min(1).max(100).optional(),
  topic: z.string().max(4096).nullable().optional(),
  parent_id: snowflakeSchema.nullable().optional(),
  nsfw: z.boolean().optional(),
  position: z.int().min(0).optional(),
  bitrate: z.int().min(8000).max(512_000).optional(),
  user_limit: z.int().min(0).max(99).optional(),
  rate_limit_per_user: z.int().min(0).max(21_600).optional(),
  rtc_region: z.string().nullable().optional(),
  video_quality_mode: z.literal([1, 2]).optional(),
  default_auto_archive_duration: z.literal([60, 1440, 4320, 10_080]).optional(),
  default_thread_rate_limit_per_user: z.int().min(0).max(21_600).optional(),
  permission_overwrites: z.array(overwriteSchema).optional(),
  reason: reasonSchema,
});
export const deleteChannelInput = z.strictObject({
  channel_id: snowflakeSchema,
  reason: reasonSchema,
});
export const followInput = z.strictObject({
  channel_id: snowflakeSchema,
  webhook_channel_id: snowflakeSchema,
  reason: reasonSchema,
});
export const followOutput = z.strictObject({
  channel_id: snowflakeSchema,
  webhook_id: snowflakeSchema,
});
