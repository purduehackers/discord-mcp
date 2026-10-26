import type { REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  Routes,
  type RESTPostAPIAutoModerationRuleJSONBody,
  type RESTPatchAPIAutoModerationRuleJSONBody,
} from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** List a guild's auto-moderation rules, actions, and exemptions.. */
export function listAutoModRules(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_auto_mod_rules",
    {
      description: "List a guild's auto-moderation rules, actions, and exemptions.",
      inputSchema: schemas.guildInput,
      outputSchema: schemas.ruleListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.ruleListOutput, async () => {
        return {
          rules: await rest.get(Routes.guildAutoModerationRules(input.guild_id), {
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Read one auto-moderation rule.. */
export function getAutoModRule(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "get_auto_mod_rule",
    {
      description: "Read one auto-moderation rule.",
      inputSchema: schemas.ruleInput,
      outputSchema: schemas.ruleOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.ruleOutput, async () => {
        return {
          rule: await rest.get(Routes.guildAutoModerationRule(input.guild_id, input.rule_id), {
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Create a typed keyword, spam, preset, mention-spam, or member-profile auto-moderation rule.. */
export function createAutoModRule(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "create_auto_mod_rule",
    {
      description:
        "Create a typed keyword, spam, preset, mention-spam, or member-profile auto-moderation rule.",
      inputSchema: schemas.createInput,
      outputSchema: schemas.ruleOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.ruleOutput, async () => {
        const { guild_id, reason, ...body } = input;
        return {
          rule: await rest.post(Routes.guildAutoModerationRules(guild_id), {
            body: body satisfies RESTPostAPIAutoModerationRuleJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Update a rule's settings, actions, or exemptions. */
export function updateAutoModRule(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "update_auto_mod_rule",
    {
      description:
        "Update a rule's settings, actions, or exemptions. Its trigger type cannot be changed.",
      inputSchema: schemas.editInput,
      outputSchema: schemas.ruleOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.ruleOutput, async () => {
        const { guild_id, rule_id, reason, ...body } = input;
        return {
          rule: await rest.patch(Routes.guildAutoModerationRule(guild_id, rule_id), {
            body: body satisfies RESTPatchAPIAutoModerationRuleJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Delete an auto-moderation rule and its protection.. */
export function deleteAutoModRule(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "delete_auto_mod_rule",
    {
      description: "Delete an auto-moderation rule and its protection.",
      inputSchema: schemas.deleteInput,
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
        await rest.delete(Routes.guildAutoModerationRule(input.guild_id, input.rule_id), {
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}
