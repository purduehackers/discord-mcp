import type { REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  Routes,
  type RESTPostAPIGuildRoleJSONBody,
  type RESTPatchAPIGuildRoleJSONBody,
} from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** List guild roles, positions, and permission bitfields.. */
export function listRoles(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_roles",
    {
      description: "List guild roles, positions, and permission bitfields.",
      inputSchema: schemas.guildInput,
      outputSchema: schemas.roleListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.roleListOutput, async () => {
        return {
          roles: await rest.get(Routes.guildRoles(input.guild_id), {
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Create a guild role with selected permissions and appearance.. */
export function createRole(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "create_role",
    {
      description: "Create a guild role with selected permissions and appearance.",
      inputSchema: schemas.createRoleInput,
      outputSchema: schemas.roleOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.roleOutput, async () => {
        const { guild_id, reason, ...body } = input;
        return {
          role: await rest.post(Routes.guildRoles(guild_id), {
            body: body satisfies RESTPostAPIGuildRoleJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Edit selected fields on a guild role.. */
export function editRole(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "edit_role",
    {
      description: "Edit selected fields on a guild role.",
      inputSchema: schemas.editRoleInput,
      outputSchema: schemas.roleOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.roleOutput, async () => {
        const { guild_id, role_id, reason, ...body } = input;
        return {
          role: await rest.patch(Routes.guildRole(guild_id, role_id), {
            body: body satisfies RESTPatchAPIGuildRoleJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Delete a guild role and remove it from every member.. */
export function deleteRole(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "delete_role",
    {
      description: "Delete a guild role and remove it from every member.",
      inputSchema: schemas.roleInput,
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
        await rest.delete(Routes.guildRole(input.guild_id, input.role_id), {
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}

/** Add a role to one member while preserving their other roles.. */
export function assignRole(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "assign_role",
    {
      description: "Add a role to one member while preserving their other roles.",
      inputSchema: schemas.memberRoleInput,
      outputSchema: schemas.successSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.successSchema, async () => {
        await rest.put(Routes.guildMemberRole(input.guild_id, input.user_id, input.role_id), {
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}

/** Remove one role from a member while preserving their other roles.. */
export function removeRole(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "remove_role",
    {
      description: "Remove one role from a member while preserving their other roles.",
      inputSchema: schemas.memberRoleInput,
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
        await rest.delete(Routes.guildMemberRole(input.guild_id, input.user_id, input.role_id), {
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}
