import { Routes, type RESTPatchAPIChannelJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/threads.schemas";

export const schema = schemas.editInput.shape;
export const outputSchema = schemas.threadOutput.shape;
export const metadata = {
  name: "edit_thread",
  description: "Update thread name, archival state, lock state, invitations, or slowmode.",
  annotations: {
    title: "Edit a thread",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Updating a thread…",
    "openai/toolInvocation/invoked": "Updated thread",
    "anthropic/searchHint": "edit archive unarchive lock a Discord thread",
  },
} satisfies ToolMetadata;

/** Update thread name, archival state, lock state, invitations, or slowmode. */
export default function editThread(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(schemas.editInput, schemas.threadOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      const { thread_id, reason, ...body } = input;
      return {
        thread: await rest.patch(Routes.channel(thread_id), {
          body: body satisfies RESTPatchAPIChannelJSONBody,
          reason,
          signal,
        }),
      };
    },
  });
}
