import { makeURLSearchParams } from "@discordjs/rest";
import { Routes, type RESTGetAPIAuditLogQuery } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/audit-log.schemas";

export const schema = schemas.auditInput.shape;
export const outputSchema = schemas.auditOutput.shape;
export const metadata = {
  name: "get_audit_log",
  description:
    "Read one page of guild audit entries, actors, reasons, and field changes. Use an entry ID to paginate.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} satisfies ToolMetadata;

/** Read one page of guild audit entries, actors, reasons, and field changes. */
export default function getAuditLog(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(
    schemas.auditInput,
    schemas.auditOutput,
    input,
    context,
    async (input, rest, signal) => {
      const { guild_id, ...query } = input;
      return await rest.get(Routes.guildAuditLog(guild_id), {
        query: makeURLSearchParams<RESTGetAPIAuditLogQuery>(query),
        signal,
      });
    },
  );
}
