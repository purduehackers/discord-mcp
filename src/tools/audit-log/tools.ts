import { makeURLSearchParams, type REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import { Routes, type RESTGetAPIAuditLogQuery } from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** Read one page of guild audit entries, actors, reasons, and field changes. */
export function getAuditLog(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "get_audit_log",
    {
      description:
        "Read one page of guild audit entries, actors, reasons, and field changes. Use an entry ID to paginate.",
      inputSchema: schemas.auditInput,
      outputSchema: schemas.auditOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.auditOutput, async () => {
        const { guild_id, ...query } = input;
        return await rest.get(Routes.guildAuditLog(guild_id), {
          query: makeURLSearchParams<RESTGetAPIAuditLogQuery>(query),
          signal: context.mcpReq.signal,
        });
      }),
  );
}
