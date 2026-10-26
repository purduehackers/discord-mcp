/** @fileoverview Event schemas enforce channel and location requirements before Discord receives a request. */
import {
  GuildScheduledEventEntityType,
  GuildScheduledEventStatus,
  type APIGuildScheduledEvent,
} from "discord-api-types/v10";
import { z } from "zod";

import {
  imageSchema,
  reasonSchema,
  snowflakeSchema,
  successSchema,
  timestampSchema,
} from "../../schemas";
export { successSchema };
export const eventSchema = z
  .strictObject({
    id: snowflakeSchema,
    guild_id: snowflakeSchema,
    channel_id: snowflakeSchema.nullable(),
    name: z.string(),
    description: z.string().nullable().optional(),
    scheduled_start_time: z.string(),
    scheduled_end_time: z.string().nullable(),
    entity_type: z.enum(GuildScheduledEventEntityType),
    status: z.enum(GuildScheduledEventStatus),
    entity_metadata: z.strictObject({ location: z.string().optional() }).strip().nullable(),
    user_count: z.int().optional(),
    image: z.string().nullable().optional(),
  })
  .strip() satisfies z.ZodType<
  Pick<
    APIGuildScheduledEvent,
    | "id"
    | "guild_id"
    | "name"
    | "channel_id"
    | "scheduled_start_time"
    | "scheduled_end_time"
    | "entity_type"
    | "status"
  >
>;
export const eventOutput = z.strictObject({ event: eventSchema });
export const eventListOutput = z.strictObject({ events: z.array(eventSchema) });
export const listInput = z.strictObject({
  guild_id: snowflakeSchema,
  with_user_count: z.boolean().default(true),
});
export const createInput = z
  .strictObject({
    guild_id: snowflakeSchema,
    name: z.string().trim().min(1).max(100),
    description: z.string().max(1000).optional(),
    entity_type: z.enum(GuildScheduledEventEntityType),
    privacy_level: z.literal(2).default(2),
    scheduled_start_time: timestampSchema,
    scheduled_end_time: timestampSchema.optional(),
    channel_id: snowflakeSchema.optional(),
    entity_metadata: z.strictObject({ location: z.string().trim().min(1).max(100) }).optional(),
    image: imageSchema.optional(),
    reason: reasonSchema,
  })
  .superRefine((input, context) => {
    if (input.entity_type === GuildScheduledEventEntityType.External) {
      if (!input.entity_metadata)
        context.addIssue({
          code: "custom",
          path: ["entity_metadata"],
          message: "External events require a location.",
        });
      if (!input.scheduled_end_time)
        context.addIssue({
          code: "custom",
          path: ["scheduled_end_time"],
          message: "External events require an end time.",
        });
      if (input.channel_id)
        context.addIssue({
          code: "custom",
          path: ["channel_id"],
          message: "External events cannot have a channel.",
        });
    } else if (!input.channel_id)
      context.addIssue({
        code: "custom",
        path: ["channel_id"],
        message: "Voice and stage events require a channel.",
      });
    if (
      input.scheduled_end_time &&
      Date.parse(input.scheduled_end_time) <= Date.parse(input.scheduled_start_time)
    )
      context.addIssue({
        code: "custom",
        path: ["scheduled_end_time"],
        message: "End time must follow start time.",
      });
  });
export const editInput = z
  .strictObject({
    guild_id: snowflakeSchema,
    event_id: snowflakeSchema,
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().max(1000).nullable().optional(),
    entity_type: z.enum(GuildScheduledEventEntityType).optional(),
    status: z.enum(GuildScheduledEventStatus).optional(),
    scheduled_start_time: timestampSchema.optional(),
    scheduled_end_time: timestampSchema.optional(),
    channel_id: snowflakeSchema.nullable().optional(),
    entity_metadata: z
      .strictObject({ location: z.string().trim().min(1).max(100) })
      .nullable()
      .optional(),
    image: imageSchema.nullable().optional(),
    reason: reasonSchema,
  })
  .superRefine((input, context) => {
    if (input.entity_type === GuildScheduledEventEntityType.External && input.channel_id !== null)
      context.addIssue({
        code: "custom",
        path: ["channel_id"],
        message: "Set channel_id to null when switching to an external event.",
      });
    if (
      input.scheduled_start_time &&
      input.scheduled_end_time &&
      Date.parse(input.scheduled_end_time) <= Date.parse(input.scheduled_start_time)
    )
      context.addIssue({
        code: "custom",
        path: ["scheduled_end_time"],
        message: "End time must follow start time.",
      });
  });
export const deleteInput = z.strictObject({
  guild_id: snowflakeSchema,
  event_id: snowflakeSchema,
  reason: reasonSchema,
});
