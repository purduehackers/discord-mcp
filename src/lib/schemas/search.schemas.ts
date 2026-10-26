import {
  MessageSearchAuthorType,
  MessageSearchHasType,
  MessageSearchSortMode,
  type RESTGetAPIGuildMessagesSearchQuery,
} from "discord-api-types/v10";
import { z } from "zod";

import { snowflakeSchema } from "../schemas";
import { channelSchema } from "./channels.schemas";
import { messageSchema } from "./messages.schemas";

export const searchInput = z
  .strictObject({
    guild_id: snowflakeSchema,
    content: z.string().trim().min(1).max(1024).optional(),
    channel_id: z.array(snowflakeSchema).min(1).max(500).optional(),
    author_id: z.array(snowflakeSchema).min(1).max(100).optional(),
    author_type: z.array(z.enum(MessageSearchAuthorType)).min(1).max(6).optional(),
    mentions: z.array(snowflakeSchema).min(1).max(100).optional(),
    mentions_role_id: z.array(snowflakeSchema).min(1).max(100).optional(),
    mention_everyone: z.boolean().optional(),
    has: z.array(z.enum(MessageSearchHasType)).min(1).max(18).optional(),
    pinned: z.boolean().optional(),
    min_id: snowflakeSchema.optional().describe("Search after this message ID."),
    max_id: snowflakeSchema.optional().describe("Search before this message ID."),
    sort_by: z.enum(MessageSearchSortMode).default(MessageSearchSortMode.Timestamp),
    sort_order: z.enum(["asc", "desc"]).default("desc"),
    include_nsfw: z.boolean().default(false),
    limit: z.int().min(1).max(25).default(25),
    offset: z.int().min(0).max(9975).default(0),
  })
  .refine(
    (input) =>
      !input.min_id ||
      !input.max_id ||
      input.min_id.length < input.max_id.length ||
      (input.min_id.length === input.max_id.length && input.min_id < input.max_id),
    {
      path: ["max_id"],
      message: "max_id must be greater than min_id.",
    },
  ) satisfies z.ZodType<RESTGetAPIGuildMessagesSearchQuery & { guild_id: string }>;

const searchResultsSchema = z
  .strictObject({
    messages: z.array(z.array(messageSchema)),
    total_results: z.int().min(0),
    doing_deep_historical_index: z.boolean(),
    documents_indexed: z.int().min(0).optional(),
    threads: z.array(channelSchema).optional(),
  })
  .strip();
export const searchResponseSchema = z.union([
  searchResultsSchema,
  z
    .strictObject({
      code: z.literal(110_000),
      message: z.string(),
      documents_indexed: z.int().min(0),
      retry_after: z.number().nonnegative(),
    })
    .strip(),
]);
export const searchOutput = searchResultsSchema.extend({
  offset: z.int().min(0),
  next_offset: z
    .int()
    .min(0)
    .max(9975)
    .optional()
    .describe(
      "Based on Discord's approximate total. A short page alone does not mean search is complete.",
    ),
});
