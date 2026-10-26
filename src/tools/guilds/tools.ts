import { makeURLSearchParams, type REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  Routes,
  type RESTGetAPIGuildQuery,
  type RESTPatchAPIGuildJSONBody,
} from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** Read guild settings and approximate member and presence counts.. */
export function getServerInfo(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "get_server_info",
    {
      description: "Read guild settings and approximate member and presence counts.",
      inputSchema: schemas.guildInput,
      outputSchema: schemas.guildOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.guildOutput, async () => {
        return {
          guild: await rest.get(Routes.guild(input.guild_id), {
            query: makeURLSearchParams<RESTGetAPIGuildQuery>({ with_counts: true }),
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Read a guild's public preview and approximate counts.. */
export function getGuildPreview(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "get_guild_preview",
    {
      description: "Read a guild's public preview and approximate counts.",
      inputSchema: schemas.guildInput,
      outputSchema: schemas.guildOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.guildOutput, async () => {
        return {
          guild: await rest.get(Routes.guildPreview(input.guild_id), {
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Read the guild's vanity invite code and use count.. */
export function getVanityUrl(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "get_vanity_url",
    {
      description: "Read the guild's vanity invite code and use count.",
      inputSchema: schemas.guildInput,
      outputSchema: schemas.vanityOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.vanityOutput, async () => {
        return await rest.get(Routes.guildVanityUrl(input.guild_id), {
          signal: context.mcpReq.signal,
        });
      }),
  );
}

/** Update selected guild settings. */
export function updateGuild(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "update_guild",
    {
      description:
        "Update selected guild settings. Null clears supported artwork or channel fields.",
      inputSchema: schemas.updateGuildInput,
      outputSchema: schemas.guildOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.guildOutput, async () => {
        const { guild_id, reason, ...body } = input;
        return {
          guild: await rest.patch(Routes.guild(guild_id), {
            body: body satisfies RESTPatchAPIGuildJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}
