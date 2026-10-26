import { z } from "zod";

import { reasonSchema, snowflakeSchema, timestampSchema } from "../schemas";
import { channelSchema } from "./channels.schemas";
export const guildInput = z.strictObject({ guild_id: snowflakeSchema });
export const threadOutput = z.strictObject({ thread: channelSchema });
export const threadListOutput = z.strictObject({
  threads: z.array(channelSchema),
  members: z.array(
    z
      .strictObject({
        id: snowflakeSchema.optional(),
        user_id: snowflakeSchema.optional(),
        join_timestamp: z.string(),
        flags: z.int(),
      })
      .strip(),
  ),
  has_more: z.boolean().optional(),
});
export const archivedInput = z
  .strictObject({
    channel_id: snowflakeSchema,
    visibility: z.enum(["public", "private", "joined_private"]).default("public"),
    before: z.union([snowflakeSchema, timestampSchema]).optional(),
    limit: z.int().min(1).max(100).default(50),
  })
  .superRefine((input, context) => {
    if (
      input.before &&
      !(input.visibility === "joined_private" ? snowflakeSchema : timestampSchema).safeParse(
        input.before,
      ).success
    ) {
      context.addIssue({
        code: "custom",
        path: ["before"],
        message:
          "Joined-private threads use a thread ID cursor; other archived lists use an archive timestamp.",
      });
    }
  });
export const createInput = z
  .strictObject({
    channel_id: snowflakeSchema,
    name: z.string().trim().min(1).max(100),
    type: z.literal([11, 12]).default(11).describe("11 public thread, 12 private thread."),
    auto_archive_duration: z.literal([60, 1440, 4320, 10_080]).optional(),
    rate_limit_per_user: z.int().min(0).max(21_600).optional(),
    invitable: z.boolean().optional(),
    reason: reasonSchema,
  })
  .refine((input) => input.invitable === undefined || input.type === 12, {
    path: ["invitable"],
    message: "Only private threads accept invitable.",
  });
export const fromMessageInput = z.strictObject({
  channel_id: snowflakeSchema,
  message_id: snowflakeSchema,
  name: z.string().trim().min(1).max(100),
  auto_archive_duration: z.literal([60, 1440, 4320, 10_080]).optional(),
  rate_limit_per_user: z.int().min(0).max(21_600).optional(),
  reason: reasonSchema,
});
export const editInput = z.strictObject({
  thread_id: snowflakeSchema,
  name: z.string().trim().min(1).max(100).optional(),
  archived: z.boolean().optional(),
  locked: z.boolean().optional(),
  invitable: z.boolean().optional(),
  auto_archive_duration: z.literal([60, 1440, 4320, 10_080]).optional(),
  rate_limit_per_user: z.int().min(0).max(21_600).optional(),
  reason: reasonSchema,
});
export const deleteInput = z.strictObject({ thread_id: snowflakeSchema, reason: reasonSchema });
