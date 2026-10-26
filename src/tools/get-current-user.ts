import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/users.schemas";

export const schema = schemas.currentUserInput.shape;
export const outputSchema = schemas.userOutput.shape;
export const metadata = {
  name: "get_current_user",
  description: "Read the identity associated with the supplied Discord credentials.",
  annotations: {
    title: "Check Discord identity",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Checking Discord identity…",
    "openai/toolInvocation/invoked": "Checked Discord identity",
    "anthropic/searchHint": "identify the Discord bot or user authenticated by this token",
  },
} satisfies ToolMetadata;

/** Read the identity associated with the supplied Discord credentials. */
export default function getCurrentUser(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.currentUserInput, schemas.userOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (_arguments, rest, signal) => {
      return { user: await rest.get(Routes.user(), { signal }) };
    },
  });
}
