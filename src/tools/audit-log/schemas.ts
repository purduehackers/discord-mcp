import { AuditLogEvent, type APIAuditLogEntry } from "discord-api-types/v10";
import { z } from "zod";

import { snowflakeSchema } from "../../schemas";
import { actionSchema, metadataSchema } from "../auto-moderation/schemas";
import { overwriteSchema } from "../channels/schemas";
import { userSchema } from "../users/schemas";
export const auditInput = z
  .strictObject({
    guild_id: snowflakeSchema,
    user_id: snowflakeSchema.optional(),
    action_type: z.enum(AuditLogEvent).optional(),
    before: snowflakeSchema.optional(),
    after: snowflakeSchema.optional(),
    limit: z.int().min(1).max(100).default(50),
  })
  .refine((input) => !(input.before && input.after), {
    path: ["after"],
    message: "Choose before or after.",
  });
export const changeValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.string()),
  z.array(z.strictObject({ id: snowflakeSchema, name: z.string() })),
  z.array(overwriteSchema),
  z.array(actionSchema),
  metadataSchema,
  z.strictObject({ emoji_id: snowflakeSchema.nullable(), emoji_name: z.string().nullable() }),
  z.strictObject({
    primary_color: z.int(),
    secondary_color: z.int().nullable(),
    tertiary_color: z.int().nullable(),
  }),
  z.array(
    z.strictObject({
      id: snowflakeSchema,
      name: z.string(),
      moderated: z.boolean(),
      emoji_id: snowflakeSchema.nullable(),
      emoji_name: z.string().nullable(),
    }),
  ),
]);
export const entrySchema = z
  .strictObject({
    id: snowflakeSchema,
    target_id: z.string().nullable(),
    user_id: snowflakeSchema.nullable(),
    action_type: z
      .int()
      .min(0)
      .describe("Discord audit action code, including newly introduced events."),
    reason: z.string().optional(),
    changes: z
      .array(
        z.strictObject({
          key: z.string(),
          old_value: changeValueSchema.optional(),
          new_value: changeValueSchema.optional(),
        }),
      )
      .optional(),
  })
  .strip() satisfies z.ZodType<
  Pick<APIAuditLogEntry, "id" | "target_id" | "user_id" | "reason"> & { action_type: number }
>;
export const auditOutput = z
  .strictObject({ audit_log_entries: z.array(entrySchema), users: z.array(userSchema) })
  .strip();
