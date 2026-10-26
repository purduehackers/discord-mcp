import type { REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  Routes,
  type RESTPostAPIChannelWebhookJSONBody,
  type RESTPatchAPIWebhookJSONBody,
} from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** Lists guild webhooks without exposing their credential-bearing fields. */
export function listGuildWebhooks(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_guild_webhooks",
    {
      description: "List webhook metadata across all channels in a guild.",
      inputSchema: schemas.guildInput,
      outputSchema: schemas.webhookListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.webhookListOutput, async () => ({
        webhooks: await rest.get(Routes.guildWebhooks(input.guild_id), {
          signal: context.mcpReq.signal,
        }),
      })),
  );
}

/** List channel webhook metadata. */
export function listWebhooks(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_webhooks",
    {
      description:
        "List channel webhook metadata. Credential-bearing tokens and URLs are excluded from output.",
      inputSchema: schemas.channelInput,
      outputSchema: schemas.webhookListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.webhookListOutput, async () => {
        return {
          webhooks: await rest.get(Routes.channelWebhooks(input.channel_id), {
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Create a channel webhook and return its metadata. */
export function createWebhook(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "create_webhook",
    {
      description:
        "Create a channel webhook and return its metadata. Manage its secret URL through Discord's integration settings.",
      inputSchema: schemas.createInput,
      outputSchema: schemas.webhookOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.webhookOutput, async () => {
        const { channel_id, reason, ...body } = input;
        return {
          webhook: await rest.post(Routes.channelWebhooks(channel_id), {
            body: body satisfies RESTPostAPIChannelWebhookJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Update webhook name, avatar, or destination channel.. */
export function editWebhook(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "edit_webhook",
    {
      description: "Update webhook name, avatar, or destination channel.",
      inputSchema: schemas.editInput,
      outputSchema: schemas.webhookOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.webhookOutput, async () => {
        const { webhook_id, reason, ...body } = input;
        return {
          webhook: await rest.patch(Routes.webhook(webhook_id), {
            body: body satisfies RESTPatchAPIWebhookJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Delete a webhook and invalidate its integration URL.. */
export function deleteWebhook(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "delete_webhook",
    {
      description: "Delete a webhook and invalidate its integration URL.",
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
        await rest.delete(Routes.webhook(input.webhook_id), {
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}
