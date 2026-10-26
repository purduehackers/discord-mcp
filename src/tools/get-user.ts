import { Routes } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/users.schemas";

export const schema = schemas.userInput.shape;
export const outputSchema = schemas.userOutput.shape;
export const metadata = {
  name: "get_user",
  description: "Read a Discord user's profile by ID.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Read a Discord user's profile by ID. */
export default function getUser(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(
    schemas.userInput,
    schemas.userOutput,
    input,
    context,
    async (input, rest, signal) => {
      return {
        user: await rest.get(Routes.user(input.user_id), { signal }),
      };
    },
  );
}
