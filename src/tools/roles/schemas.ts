import type { APIRole } from "discord-api-types/v10";
import { z } from "zod";

import {
  imageSchema,
  permissionsSchema,
  reasonSchema,
  snowflakeSchema,
  successSchema,
} from "../../schemas";
export { successSchema };
export const roleSchema = z
  .strictObject({
    id: snowflakeSchema,
    name: z.string(),
    color: z.int(),
    hoist: z.boolean(),
    position: z.int(),
    permissions: permissionsSchema,
    managed: z.boolean(),
    mentionable: z.boolean(),
    icon: z.string().nullable().optional(),
    unicode_emoji: z.string().nullable().optional(),
  })
  .strip() satisfies z.ZodType<
  Pick<
    APIRole,
    "id" | "name" | "color" | "hoist" | "position" | "permissions" | "managed" | "mentionable"
  >
>;
export const guildInput = z.strictObject({ guild_id: snowflakeSchema });
export const roleInput = z.strictObject({
  guild_id: snowflakeSchema,
  role_id: snowflakeSchema,
  reason: reasonSchema,
});
export const roleOutput = z.strictObject({ role: roleSchema });
export const roleListOutput = z.strictObject({ roles: z.array(roleSchema) });
export const createRoleInput = z.strictObject({
  guild_id: snowflakeSchema,
  name: z.string().trim().min(1).max(100),
  permissions: permissionsSchema.optional(),
  color: z.int().min(0).max(16777215).optional(),
  hoist: z.boolean().optional(),
  mentionable: z.boolean().optional(),
  icon: imageSchema.nullable().optional(),
  unicode_emoji: z.string().nullable().optional(),
  reason: reasonSchema,
});
export const editRoleInput = createRoleInput.extend({
  role_id: snowflakeSchema,
  name: z.string().trim().min(1).max(100).optional(),
});
export const memberRoleInput = roleInput.extend({ user_id: snowflakeSchema });
