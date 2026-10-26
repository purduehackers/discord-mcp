/** @fileoverview Message schemas distinguish creation, edits, pagination, and explicit mentions. */
import { AllowedMentionsTypes, type APIMessage, type APIEmbed } from "discord-api-types/v10";
import { z } from "zod";

import {
  fileSchema,
  reasonSchema,
  snowflakeSchema,
  successSchema,
  timestampSchema,
} from "../../schemas";
import { userSchema } from "../users/schemas";

export { successSchema };
export const embedSchema = z.strictObject({
  title: z.string().max(256).optional(),
  description: z.string().max(4096).optional(),
  url: z.string().optional(),
  timestamp: timestampSchema.optional(),
  color: z.int().min(0).max(16777215).optional(),
  footer: z
    .strictObject({ text: z.string().max(2048), icon_url: z.string().optional() })
    .optional(),
  author: z
    .strictObject({
      name: z.string().max(256),
      url: z.string().optional(),
      icon_url: z.string().optional(),
    })
    .optional(),
  image: z.strictObject({ url: z.string() }).optional(),
  thumbnail: z.strictObject({ url: z.string() }).optional(),
  fields: z
    .array(
      z.strictObject({
        name: z.string().max(256),
        value: z.string().max(1024),
        inline: z.boolean().optional(),
      }),
    )
    .max(25)
    .optional(),
}) satisfies z.ZodType<APIEmbed>;
export const messageSchema = z
  .strictObject({
    id: snowflakeSchema,
    channel_id: snowflakeSchema,
    author: userSchema.partial({ global_name: true }),
    content: z.string(),
    timestamp: z.string(),
    edited_timestamp: z.string().nullable(),
    pinned: z.boolean(),
    attachments: z.array(
      z
        .strictObject({
          id: snowflakeSchema,
          filename: z.string(),
          size: z.int(),
          url: z.string(),
          content_type: z.string().optional(),
        })
        .strip(),
    ),
    embeds: z.array(
      z
        .strictObject({
          title: z.string().optional(),
          description: z.string().optional(),
          url: z.string().optional(),
          fields: z
            .array(
              z
                .strictObject({
                  name: z.string(),
                  value: z.string(),
                  inline: z.boolean().optional(),
                })
                .strip(),
            )
            .optional(),
          image: z.strictObject({ url: z.string().optional() }).strip().optional(),
          thumbnail: z.strictObject({ url: z.string().optional() }).strip().optional(),
          footer: z.strictObject({ text: z.string() }).strip().optional(),
          author: z.strictObject({ name: z.string().optional() }).strip().optional(),
        })
        .strip(),
    ),
    message_reference: z
      .strictObject({
        message_id: snowflakeSchema.optional(),
        channel_id: snowflakeSchema.optional(),
        guild_id: snowflakeSchema.optional(),
      })
      .strip()
      .optional(),
  })
  .strip() satisfies z.ZodType<
  Pick<APIMessage, "id" | "channel_id" | "content" | "timestamp" | "edited_timestamp" | "pinned">
>;
export const messageInput = z.strictObject({
  channel_id: snowflakeSchema,
  message_id: snowflakeSchema,
});
export const messageOutput = z.strictObject({ message: messageSchema });
export const messageListOutput = z.strictObject({ messages: z.array(messageSchema) });
export const fetchInput = z
  .strictObject({
    channel_id: snowflakeSchema,
    limit: z.int().min(1).max(100).default(50),
    before: snowflakeSchema.optional(),
    after: snowflakeSchema.optional(),
    around: snowflakeSchema.optional(),
  })
  .refine((input) => [input.before, input.after, input.around].filter(Boolean).length <= 1, {
    path: ["before"],
    message: "Choose only one history cursor: before, after, or around.",
  });
export const mentionsSchema = z
  .strictObject({
    parse: z.array(z.enum(AllowedMentionsTypes)).max(3).optional(),
    users: z.array(snowflakeSchema).max(100).optional(),
    roles: z.array(snowflakeSchema).max(100).optional(),
    replied_user: z.boolean().optional(),
  })
  .superRefine((value, context) => {
    if (value.users && value.parse?.includes(AllowedMentionsTypes.User))
      context.addIssue({
        code: "custom",
        path: ["users"],
        message: "Use either explicit user IDs or parse users.",
      });
    if (value.roles && value.parse?.includes(AllowedMentionsTypes.Role))
      context.addIssue({
        code: "custom",
        path: ["roles"],
        message: "Use either explicit role IDs or parse roles.",
      });
  });
export const sendInput = z
  .strictObject({
    channel_id: snowflakeSchema,
    content: z.string().max(2000).optional(),
    embeds: z.array(embedSchema).max(10).optional(),
    files: z.array(fileSchema).max(10).optional(),
    allowed_mentions: mentionsSchema.default({ parse: [] }),
    message_reference: z
      .strictObject({ message_id: snowflakeSchema, fail_if_not_exists: z.boolean().optional() })
      .optional(),
    tts: z.boolean().optional(),
    suppress_embeds: z.boolean().default(false),
    silent: z.boolean().default(false),
  })
  .refine((value) => Boolean(value.content || value.embeds?.length || value.files?.length), {
    path: ["content"],
    message: "Provide content, embeds, or files.",
  });
export const editInput = z
  .strictObject({
    channel_id: snowflakeSchema,
    message_id: snowflakeSchema,
    content: z.string().max(2000).optional(),
    embeds: z.array(embedSchema).max(10).optional(),
    allowed_mentions: mentionsSchema.optional(),
  })
  .refine(
    (value) =>
      value.content !== undefined ||
      value.embeds !== undefined ||
      value.allowed_mentions !== undefined,
    {
      path: ["content"],
      message: "Provide at least one message field to edit.",
    },
  );
export const auditedMessageInput = z.strictObject({
  channel_id: snowflakeSchema,
  message_id: snowflakeSchema,
  reason: reasonSchema,
});
export const bulkDeleteInput = z
  .strictObject({
    channel_id: snowflakeSchema,
    messages: z.array(snowflakeSchema).min(2).max(100),
    reason: reasonSchema,
  })
  .refine((value) => new Set(value.messages).size === value.messages.length, {
    path: ["messages"],
    message: "Message IDs must be unique.",
  });
export const reactionInput = z.strictObject({
  channel_id: snowflakeSchema,
  message_id: snowflakeSchema,
  emoji: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .describe("Unicode emoji or custom name:id. Do not URL-encode."),
});
export const removeReactionInput = reactionInput.extend({
  user_id: z.union([snowflakeSchema, z.literal("@me")]).default("@me"),
});
