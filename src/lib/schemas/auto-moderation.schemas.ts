/** @fileoverview Auto-moderation schemas require metadata appropriate to each action and trigger. */
import {
  AutoModerationRuleTriggerType,
  AutoModerationRuleEventType,
  type APIAutoModerationRule,
  type APIAutoModerationAction,
} from "discord-api-types/v10";
import { z } from "zod";

import { reasonSchema, snowflakeSchema, successSchema } from "../schemas";
export { successSchema };
export const actionSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal(1),
    metadata: z
      .strictObject({ custom_message: z.string().max(150).nullable().optional() })
      .optional(),
  }),
  z.strictObject({ type: z.literal(2), metadata: z.strictObject({ channel_id: snowflakeSchema }) }),
  z.strictObject({
    type: z.literal(3),
    metadata: z.strictObject({ duration_seconds: z.int().min(1).max(2_419_200) }),
  }),
  z.strictObject({ type: z.literal(4), metadata: z.strictObject({}).optional() }),
]) satisfies z.ZodType<APIAutoModerationAction>;
export const metadataSchema = z.strictObject({
  keyword_filter: z.array(z.string().min(1).max(60)).max(1000).optional(),
  regex_patterns: z.array(z.string().min(1).max(260)).max(10).optional(),
  presets: z
    .array(z.literal([1, 2, 3]))
    .max(3)
    .optional(),
  allow_list: z.array(z.string().min(1).max(60)).max(1000).optional(),
  mention_total_limit: z.int().min(1).max(50).optional(),
  mention_raid_protection_enabled: z.boolean().optional(),
});
export const ruleSchema = z
  .strictObject({
    id: snowflakeSchema,
    guild_id: snowflakeSchema,
    creator_id: snowflakeSchema,
    name: z.string(),
    event_type: z.enum(AutoModerationRuleEventType),
    trigger_type: z.enum(AutoModerationRuleTriggerType),
    trigger_metadata: metadataSchema,
    actions: z.array(actionSchema),
    enabled: z.boolean(),
    exempt_roles: z.array(snowflakeSchema),
    exempt_channels: z.array(snowflakeSchema),
  })
  .strip() satisfies z.ZodType<APIAutoModerationRule>;
export const guildInput = z.strictObject({ guild_id: snowflakeSchema });
export const ruleInput = z.strictObject({ guild_id: snowflakeSchema, rule_id: snowflakeSchema });
export const ruleOutput = z.strictObject({ rule: ruleSchema });
export const ruleListOutput = z.strictObject({ rules: z.array(ruleSchema) });
export const createInput = z
  .strictObject({
    guild_id: snowflakeSchema,
    name: z.string().trim().min(1).max(100),
    event_type: z.enum(AutoModerationRuleEventType),
    trigger_type: z.enum(AutoModerationRuleTriggerType),
    trigger_metadata: metadataSchema.optional(),
    actions: z.array(actionSchema).min(1).max(3),
    enabled: z.boolean().optional(),
    exempt_roles: z.array(snowflakeSchema).max(20).optional(),
    exempt_channels: z.array(snowflakeSchema).max(50).optional(),
    reason: reasonSchema,
  })
  .superRefine((input, context) => {
    if ((input.trigger_type === 6) !== (input.event_type === 2))
      context.addIssue({
        code: "custom",
        path: ["event_type"],
        message:
          "Member-profile rules use member-update events; other triggers use message-send events.",
      });
    if (
      [1, 6].includes(input.trigger_type) &&
      !input.trigger_metadata?.keyword_filter?.length &&
      !input.trigger_metadata?.regex_patterns?.length
    )
      context.addIssue({
        code: "custom",
        path: ["trigger_metadata"],
        message: "Provide keyword_filter or regex_patterns.",
      });
    if (input.trigger_type === 4 && !input.trigger_metadata?.presets?.length)
      context.addIssue({
        code: "custom",
        path: ["trigger_metadata", "presets"],
        message: "Keyword-preset rules require presets.",
      });
    if (input.trigger_type === 5 && input.trigger_metadata?.mention_total_limit === undefined)
      context.addIssue({
        code: "custom",
        path: ["trigger_metadata", "mention_total_limit"],
        message: "Mention-spam rules require a mention limit.",
      });
  });
export const editInput = z.strictObject({
  guild_id: snowflakeSchema,
  rule_id: snowflakeSchema,
  name: z.string().trim().min(1).max(100).optional(),
  event_type: z.enum(AutoModerationRuleEventType).optional(),
  trigger_metadata: metadataSchema.optional(),
  actions: z.array(actionSchema).min(1).max(3).optional(),
  enabled: z.boolean().optional(),
  exempt_roles: z.array(snowflakeSchema).max(20).optional(),
  exempt_channels: z.array(snowflakeSchema).max(50).optional(),
  reason: reasonSchema,
});
export const deleteInput = ruleInput.extend({ reason: reasonSchema });
