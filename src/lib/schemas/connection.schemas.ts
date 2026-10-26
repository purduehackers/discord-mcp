import { z } from "zod";

import { permissionsSchema, snowflakeSchema } from "../schemas";
import { channelSchema } from "./channels.schemas";
import { roleSchema } from "./roles.schemas";
import { userGuildSchema, userSchema } from "./users.schemas";

export const connectionInput = z
  .strictObject({
    guild_id: snowflakeSchema
      .optional()
      .describe("Inspect permissions and role hierarchy in this server."),
    channel_id: snowflakeSchema
      .optional()
      .describe("Also inspect this channel's overwrites. Requires guild_id."),
    limit: z.int().min(1).max(200).default(50),
    after: snowflakeSchema.optional().describe("Cursor for the accessible-server list."),
  })
  .refine((input) => !input.channel_id || Boolean(input.guild_id), {
    path: ["guild_id"],
    message: "Supply guild_id when inspecting a channel.",
  });
const permissionSummarySchema = z.strictObject({
  bitfield: permissionsSchema,
  names: z.array(z.string()),
});
const errorSchema = z
  .strictObject({
    message: z.string(),
    code: z.union([z.int(), z.string()]).optional(),
    status: z.int().optional(),
    hint: z.string().optional(),
    retry_after: z.number().nonnegative().optional(),
  })
  .strip();
const failedCheckSchema = z.strictObject({ status: z.literal("error"), error: errorSchema });
export const guildCheckSchema = z.strictObject({
  status: z.literal("ok"),
  id: snowflakeSchema,
  name: z.string(),
  owner: z.boolean(),
  permissions: permissionSummarySchema,
  roles: z.array(roleSchema.pick({ id: true, name: true, position: true, managed: true })),
});
export const channelCheckSchema = z.strictObject({
  status: z.literal("ok"),
  channel: channelSchema,
  overwrites_from_channel_id: snowflakeSchema,
  permissions: permissionSummarySchema,
  permission_checks: z.strictObject({
    view_channel: z.boolean(),
    read_message_history: z.boolean(),
    send_messages: z.boolean(),
  }),
  notes: z.array(z.string()),
});
export const connectionOutput = z.strictObject({
  user: userSchema,
  guilds: z.discriminatedUnion("status", [
    z.strictObject({
      status: z.literal("ok"),
      items: z.array(userGuildSchema.extend({ permission_names: z.array(z.string()) })),
      next_after: snowflakeSchema.optional(),
    }),
    failedCheckSchema,
  ]),
  guild: z.discriminatedUnion("status", [guildCheckSchema, failedCheckSchema]).optional(),
  channel: z.discriminatedUnion("status", [channelCheckSchema, failedCheckSchema]).optional(),
  notes: z.array(z.string()),
});
