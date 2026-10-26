/** @fileoverview Registers member operations with Discord permission enforcement and audit reasons. */
import { makeURLSearchParams, type REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  Routes,
  type RESTGetAPIGuildMembersQuery,
  type RESTGetAPIGuildMembersSearchQuery,
  type RESTPatchAPIGuildMemberJSONBody,
  type RESTPutAPIGuildBanJSONBody,
  type RESTGetAPIGuildBansQuery,
} from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** Read a guild member's profile, roles, nickname, and moderation state.. */
export function getMember(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "get_member",
    {
      description: "Read a guild member's profile, roles, nickname, and moderation state.",
      inputSchema: schemas.memberInput,
      outputSchema: schemas.memberOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.memberOutput, async () => {
        return {
          member: await rest.get(Routes.guildMember(input.guild_id, input.user_id), {
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Read one page of guild members. */
export function listMembers(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_members",
    {
      description:
        "Read one page of guild members. Requires the members intent; use the last user ID as after.",
      inputSchema: schemas.listInput,
      outputSchema: schemas.memberListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.memberListOutput, async () => {
        const { guild_id, ...query } = input;
        return {
          members: await rest.get(Routes.guildMembers(guild_id), {
            query: makeURLSearchParams<RESTGetAPIGuildMembersQuery>(query),
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Search guild members by username or nickname prefix.. */
export function searchMembers(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "search_members",
    {
      description: "Search guild members by username or nickname prefix.",
      inputSchema: schemas.searchInput,
      outputSchema: schemas.memberListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.memberListOutput, async () => {
        const { guild_id, ...query } = input;
        return {
          members: await rest.get(Routes.guildMembersSearch(guild_id), {
            query: makeURLSearchParams<RESTGetAPIGuildMembersSearchQuery>(query),
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Set a guild member's nickname. */
export function setNickname(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "set_nickname",
    {
      description: "Set a guild member's nickname. Null clears the nickname.",
      inputSchema: schemas.nicknameInput,
      outputSchema: schemas.memberOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.memberOutput, async () => {
        return {
          member: await rest.patch(Routes.guildMember(input.guild_id, input.user_id), {
            body: { nick: input.nick } satisfies RESTPatchAPIGuildMemberJSONBody,
            reason: input.reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Restrict a member's communication until an ISO timestamp within the next 28 days.. */
export function timeoutMember(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "timeout_member",
    {
      description:
        "Restrict a member's communication until an ISO timestamp within the next 28 days.",
      inputSchema: schemas.timeoutInput,
      outputSchema: schemas.memberOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.memberOutput, async () => {
        return {
          member: await rest.patch(Routes.guildMember(input.guild_id, input.user_id), {
            body: {
              communication_disabled_until: input.communication_disabled_until,
            } satisfies RESTPatchAPIGuildMemberJSONBody,
            reason: input.reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Clear a member's communication timeout.. */
export function clearTimeout(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "clear_timeout",
    {
      description: "Clear a member's communication timeout.",
      inputSchema: schemas.auditedMemberInput,
      outputSchema: schemas.memberOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.memberOutput, async () => {
        return {
          member: await rest.patch(Routes.guildMember(input.guild_id, input.user_id), {
            body: { communication_disabled_until: null } satisfies RESTPatchAPIGuildMemberJSONBody,
            reason: input.reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Remove a member from a guild without banning them.. */
export function kickMember(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "kick_member",
    {
      description: "Remove a member from a guild without banning them.",
      inputSchema: schemas.auditedMemberInput,
      outputSchema: schemas.successSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.successSchema, async () => {
        await rest.delete(Routes.guildMember(input.guild_id, input.user_id), {
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}

/** Ban a user from a guild. */
export function banMember(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "ban_member",
    {
      description:
        "Ban a user from a guild. Recent message deletion occurs only when delete_message_seconds is supplied.",
      inputSchema: schemas.banInput,
      outputSchema: schemas.successSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.successSchema, async () => {
        await rest.put(Routes.guildBan(input.guild_id, input.user_id), {
          body: {
            delete_message_seconds: input.delete_message_seconds,
          } satisfies RESTPutAPIGuildBanJSONBody,
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}

/** Remove a guild ban without adding the user back to the guild.. */
export function unbanMember(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "unban_member",
    {
      description: "Remove a guild ban without adding the user back to the guild.",
      inputSchema: schemas.auditedMemberInput,
      outputSchema: schemas.successSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.successSchema, async () => {
        await rest.delete(Routes.guildBan(input.guild_id, input.user_id), {
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}

/** Read one page of guild bans and recorded reasons.. */
export function listBans(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_bans",
    {
      description: "Read one page of guild bans and recorded reasons.",
      inputSchema: schemas.banListInput,
      outputSchema: schemas.banListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.banListOutput, async () => {
        const { guild_id, ...query } = input;
        return {
          bans: await rest.get(Routes.guildBans(guild_id), {
            query: makeURLSearchParams<RESTGetAPIGuildBansQuery>(query),
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}
