import { makeURLSearchParams, type REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import { Routes, type RESTGetAPICurrentUserGuildsQuery } from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** Read the identity associated with the supplied Discord credentials.. */
export function getCurrentUser(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "get_current_user",
    {
      description: "Read the identity associated with the supplied Discord credentials.",
      inputSchema: schemas.currentUserInput,
      outputSchema: schemas.userOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.userOutput, async () => {
        return { user: await rest.get(Routes.user(), { signal: context.mcpReq.signal }) };
      }),
  );
}

/** Read a Discord user's profile by ID.. */
export function getUser(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "get_user",
    {
      description: "Read a Discord user's profile by ID.",
      inputSchema: schemas.userInput,
      outputSchema: schemas.userOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.userOutput, async () => {
        return {
          user: await rest.get(Routes.user(input.user_id), { signal: context.mcpReq.signal }),
        };
      }),
  );
}

/** List one page of guilds accessible to the current identity. */
export function listGuilds(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_guilds",
    {
      description:
        "List one page of guilds accessible to the current identity. Use a returned guild ID as the next after cursor.",
      inputSchema: schemas.guildListInput,
      outputSchema: schemas.guildListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.guildListOutput, async () => {
        return {
          guilds: await rest.get(Routes.userGuilds(), {
            query: makeURLSearchParams<RESTGetAPICurrentUserGuildsQuery>(input),
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}
