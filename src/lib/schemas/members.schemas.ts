/** @fileoverview Member schemas keep pagination bounded and require valid moderation deadlines. */
import type { APIGuildMember, APIBan } from "discord-api-types/v10";
import { z } from "zod";

import { reasonSchema, snowflakeSchema, successSchema, timestampSchema } from "../schemas";
import { userSchema } from "./users.schemas";
export { successSchema };
export const memberSchema = z
  .strictObject({
    user: userSchema,
    nick: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
    roles: z.array(snowflakeSchema),
    joined_at: z.string(),
    pending: z.boolean().optional(),
    deaf: z.boolean(),
    mute: z.boolean(),
    communication_disabled_until: z.string().nullable().optional(),
  })
  .strip() satisfies z.ZodType<
  Pick<
    APIGuildMember,
    "user" | "nick" | "roles" | "joined_at" | "deaf" | "mute" | "communication_disabled_until"
  >
>;
export const memberInput = z.strictObject({ guild_id: snowflakeSchema, user_id: snowflakeSchema });
export const auditedMemberInput = memberInput.extend({ reason: reasonSchema });
export const memberOutput = z.strictObject({ member: memberSchema });
export const memberListOutput = z.strictObject({ members: z.array(memberSchema) });
export const listInput = z.strictObject({
  guild_id: snowflakeSchema,
  limit: z.int().min(1).max(1000).default(100),
  after: snowflakeSchema.optional(),
});
export const searchInput = z.strictObject({
  guild_id: snowflakeSchema,
  query: z.string().trim().min(1).max(100),
  limit: z.int().min(1).max(1000).default(100),
});
export const nicknameInput = memberInput.extend({
  nick: z.string().max(32).nullable(),
  reason: reasonSchema,
});
export const timeoutInput = memberInput
  .extend({ communication_disabled_until: timestampSchema, reason: reasonSchema })
  .refine(
    (input) => {
      const until = Date.parse(input.communication_disabled_until);
      return until > Date.now() && until <= Date.now() + 28 * 86_400_000;
    },
    { path: ["communication_disabled_until"], message: "Timeout must end in the next 28 days." },
  );
export const banInput = memberInput.extend({
  delete_message_seconds: z.int().min(0).max(604_800).default(0),
  reason: reasonSchema,
});
export const banListInput = z
  .strictObject({
    guild_id: snowflakeSchema,
    limit: z.int().min(1).max(1000).default(100),
    before: snowflakeSchema.optional(),
    after: snowflakeSchema.optional(),
  })
  .refine((input) => !(input.before && input.after), {
    path: ["after"],
    message: "Choose before or after.",
  });
export const banSchema = z
  .strictObject({ reason: z.string().nullable(), user: userSchema })
  .strip() satisfies z.ZodType<Pick<APIBan, "reason" | "user">>;
export const banListOutput = z.strictObject({ bans: z.array(banSchema) });
