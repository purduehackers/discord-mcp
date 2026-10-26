import { makeURLSearchParams } from "@discordjs/rest";
import { Routes, type RESTGetAPIChannelThreadsArchivedQuery } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/threads.schemas";

export const schema = schemas.archivedInput.shape;
export const outputSchema = schemas.threadListOutput.shape;
export const metadata = {
  name: "list_archived_threads",
  description:
    "Read one page of archived threads. Use the last archive_timestamp as before, or the thread ID for joined_private.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Read one page of archived threads. */
export default function listArchivedThreads(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.archivedInput,
    schemas.threadListOutput,
    input,
    context,
    async (input, rest, signal) => {
      const route =
        input.visibility === "joined_private"
          ? Routes.channelJoinedArchivedThreads(input.channel_id)
          : Routes.channelThreads(input.channel_id, input.visibility);
      return await rest.get(route, {
        query: makeURLSearchParams<RESTGetAPIChannelThreadsArchivedQuery>({
          before: input.before,
          limit: input.limit,
        }),
        signal,
      });
    },
  );
}
