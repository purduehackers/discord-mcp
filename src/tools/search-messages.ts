import { makeURLSearchParams } from "@discordjs/rest";
import { Result } from "better-result";
import { Routes, type RESTGetAPIGuildMessagesSearchQuery } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordCall, discordRequest } from "../lib/discord";
import { DiscordError } from "../lib/errors";
import * as schemas from "../lib/schemas/search.schemas";

export const schema = schemas.searchInput.shape;
export const outputSchema = schemas.searchOutput.shape;
export const metadata = {
  name: "search_messages",
  description:
    "Search Discord's message index in one server, with optional channel, author, content, and date-ID filters. Requires ReadMessageHistory and Message Content intent. Returns one page; totals can change and short pages do not prove completion. Indexing errors include retry_after in seconds.",
  annotations: {
    title: "Search server messages",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Searching server messages…",
    "openai/toolInvocation/invoked": "Searched server messages",
    "anthropic/searchHint":
      "search Discord message history by text author channel date attachments pinned",
  },
} satisfies ToolMetadata;

/** Searches Discord's index without scanning channel histories. */
export default function searchMessages(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.searchInput, schemas.searchOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    workflow: (input, rest, signal) =>
      Result.gen(async function* () {
        const { guild_id, ...query } = input;
        const result = yield* Result.await(
          discordCall(schemas.searchResponseSchema, () =>
            rest.get(Routes.guildMessagesSearch(guild_id), {
              query: makeURLSearchParams<RESTGetAPIGuildMessagesSearchQuery>(query),
              signal,
            }),
          ),
        );
        if ("code" in result)
          return Result.err(
            new DiscordError({
              message: "Discord is still indexing this server's messages.",
              code: result.code,
              status: 202,
              retry_after: Math.max(1, result.retry_after),
              hint: "Retry this same search after retry_after seconds. No search results are available yet.",
            }),
          );
        const next = input.offset + input.limit;
        return Result.ok({
          ...result,
          offset: input.offset,
          next_offset: next <= 9975 && next < result.total_results ? next : undefined,
        });
      }),
  });
}
