import { Routes, type RESTPutAPIGuildBanJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/members.schemas";

export const schema = schemas.banInput.shape;
export const outputSchema = schemas.successSchema.shape;
export const metadata = {
  name: "ban_member",
  description:
    "Ban a user from a guild. Recent message deletion occurs only when delete_message_seconds is supplied.",
  annotations: {
    title: "Ban a member",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Banning a member…",
    "openai/toolInvocation/invoked": "Banned member",
    "anthropic/searchHint": "ban a Discord server member and optionally delete recent messages",
  },
} satisfies ToolMetadata;

/** Ban a user from a guild. */
export default function banMember(input: InferSchema<typeof schema>, context: ToolExtraArguments) {
  return discordRequest(schemas.banInput, schemas.successSchema, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
      await rest.put(Routes.guildBan(input.guild_id, input.user_id), {
        body: {
          delete_message_seconds: input.delete_message_seconds,
        } satisfies RESTPutAPIGuildBanJSONBody,
        reason: input.reason,
        signal,
      });
      return { success: true };
    },
  });
}
