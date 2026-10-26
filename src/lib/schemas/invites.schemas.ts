import type { APIInvite } from "discord-api-types/v10";
import { z } from "zod";

import { reasonSchema, snowflakeSchema } from "../schemas";
import { userSchema } from "./users.schemas";
export const inviteSchema = z
  .strictObject({
    code: z.string(),
    guild: z.strictObject({ id: snowflakeSchema, name: z.string() }).strip().optional(),
    channel: z
      .strictObject({ id: snowflakeSchema, name: z.string().nullable().optional(), type: z.int() })
      .strip()
      .nullable(),
    inviter: userSchema.optional(),
    expires_at: z.string().nullable().optional(),
    uses: z.int().optional(),
    max_uses: z.int().optional(),
    max_age: z.int().optional(),
    temporary: z.boolean().optional(),
  })
  .strip() satisfies z.ZodType<Pick<APIInvite, "code">>;
export const inviteOutput = z.strictObject({ invite: inviteSchema });
export const inviteListOutput = z.strictObject({ invites: z.array(inviteSchema) });
export const listInput = z.strictObject({ guild_id: snowflakeSchema });
export const createInput = z.strictObject({
  channel_id: snowflakeSchema,
  max_age: z.int().min(0).max(604_800).default(86_400),
  max_uses: z.int().min(0).max(100).default(0),
  temporary: z.boolean().default(false),
  unique: z.boolean().default(false),
  reason: reasonSchema,
});
export const deleteInput = z.strictObject({
  code: z
    .string()
    .regex(/^[A-Za-z0-9-]+$/u)
    .describe("Invite code, without the discord.gg URL."),
  reason: reasonSchema,
});
