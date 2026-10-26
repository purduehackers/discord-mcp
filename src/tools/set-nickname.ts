import { Routes, type RESTPatchAPIGuildMemberJSONBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/members.schemas";

export const schema = schemas.nicknameInput.shape;
export const outputSchema = schemas.memberOutput.shape;
export const metadata = {
  name: "set_nickname",
  description: "Set a guild member's nickname. Null clears the nickname.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Set a guild member's nickname. */
export default function setNickname(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.nicknameInput,
    schemas.memberOutput,
    input,
    context,
    async (input, rest, signal) => {
      return {
        member: await rest.patch(Routes.guildMember(input.guild_id, input.user_id), {
          body: { nick: input.nick } satisfies RESTPatchAPIGuildMemberJSONBody,
          reason: input.reason,
          signal,
        }),
      };
    },
  );
}
