import type { APIEmoji } from "discord-api-types/v10";
import { z } from "zod";

import { imageSchema, reasonSchema, snowflakeSchema, successSchema } from "../../schemas";
export { successSchema };
export const emojiSchema = z
  .strictObject({
    id: snowflakeSchema.nullable(),
    name: z.string().nullable(),
    roles: z.array(snowflakeSchema).optional(),
    animated: z.boolean().optional(),
    managed: z.boolean().optional(),
    available: z.boolean().optional(),
    require_colons: z.boolean().optional(),
  })
  .strip() satisfies z.ZodType<
  Pick<APIEmoji, "id" | "name" | "roles" | "animated" | "managed" | "available" | "require_colons">
>;
export const guildInput = z.strictObject({ guild_id: snowflakeSchema });
export const emojiOutput = z.strictObject({ emoji: emojiSchema });
export const emojiListOutput = z.strictObject({ emojis: z.array(emojiSchema) });
export const createInput = z.strictObject({
  guild_id: snowflakeSchema,
  name: z.string().regex(/^[A-Za-z0-9_]{2,32}$/u),
  image: imageSchema
    .max(350000)
    .describe("Image data URI; Discord limits emoji images to 256 KiB."),
  roles: z.array(snowflakeSchema).optional(),
  reason: reasonSchema,
});
export const editInput = z.strictObject({
  guild_id: snowflakeSchema,
  emoji_id: snowflakeSchema,
  name: z
    .string()
    .regex(/^[A-Za-z0-9_]{2,32}$/u)
    .optional(),
  roles: z.array(snowflakeSchema).optional(),
  reason: reasonSchema,
});
export const deleteInput = z.strictObject({
  guild_id: snowflakeSchema,
  emoji_id: snowflakeSchema,
  reason: reasonSchema,
});
