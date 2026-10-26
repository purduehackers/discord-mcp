import { type APIUser, type RESTGetAPICurrentUserGuildsResult } from "discord-api-types/v10";
import { z } from "zod";

import { permissionsSchema, snowflakeSchema } from "../../schemas";

export const userSchema = z
  .strictObject({
    id: snowflakeSchema,
    username: z.string(),
    discriminator: z.string(),
    global_name: z.string().nullable(),
    avatar: z.string().nullable(),
    bot: z.boolean().optional(),
  })
  .strip() satisfies z.ZodType<
  Pick<APIUser, "id" | "username" | "discriminator" | "avatar" | "global_name" | "bot">
>;
export const currentUserInput = z.strictObject({});
export const userInput = z.strictObject({ user_id: snowflakeSchema });
export const userOutput = z.strictObject({ user: userSchema });
export const guildListInput = z
  .strictObject({
    before: snowflakeSchema.optional(),
    after: snowflakeSchema.optional(),
    limit: z.int().min(1).max(200).default(100),
  })
  .refine((input) => !(input.before && input.after), {
    path: ["after"],
    message: "Choose before or after.",
  });
export const userGuildSchema = z
  .strictObject({
    id: snowflakeSchema,
    name: z.string(),
    icon: z.string().nullable(),
    owner: z.boolean(),
    permissions: permissionsSchema,
    features: z.array(z.string()).describe("Guild feature names, including undocumented values."),
  })
  .strip() satisfies z.ZodType<
  Pick<
    RESTGetAPICurrentUserGuildsResult[number],
    "id" | "name" | "icon" | "owner" | "permissions"
  > & { features: string[] }
>;
export const guildListOutput = z.strictObject({ guilds: z.array(userGuildSchema) });
