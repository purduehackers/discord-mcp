import { StickerType, StickerFormatType, type APISticker } from "discord-api-types/v10";
import { z } from "zod";

import { fileSchema, reasonSchema, snowflakeSchema, successSchema } from "../schemas";
export { successSchema };
export const stickerSchema = z
  .strictObject({
    id: snowflakeSchema,
    name: z.string(),
    description: z.string().nullable(),
    tags: z.string(),
    type: z.enum(StickerType),
    format_type: z.enum(StickerFormatType),
    available: z.boolean().optional(),
    guild_id: snowflakeSchema.optional(),
  })
  .strip() satisfies z.ZodType<
  Pick<APISticker, "id" | "name" | "description" | "tags" | "type" | "format_type">
>;
export const guildInput = z.strictObject({ guild_id: snowflakeSchema });
export const stickerOutput = z.strictObject({ sticker: stickerSchema });
export const stickerListOutput = z.strictObject({ stickers: z.array(stickerSchema) });
export const createInput = z.strictObject({
  guild_id: snowflakeSchema,
  name: z.string().trim().min(2).max(30),
  description: z.union([z.literal(""), z.string().min(2).max(100)]).default(""),
  tags: z.string().trim().min(2).max(200),
  file: fileSchema.extend({
    data: z.base64().max(699_052),
    content_type: z.enum(["image/png", "image/apng", "image/gif", "application/json"]),
  }),
  reason: reasonSchema,
});
export const editInput = z.strictObject({
  guild_id: snowflakeSchema,
  sticker_id: snowflakeSchema,
  name: z.string().trim().min(2).max(30).optional(),
  description: z
    .union([z.literal(""), z.string().min(2).max(100)])
    .nullable()
    .optional(),
  tags: z.string().trim().min(2).max(200).optional(),
  reason: reasonSchema,
});
export const deleteInput = z.strictObject({
  guild_id: snowflakeSchema,
  sticker_id: snowflakeSchema,
  reason: reasonSchema,
});
