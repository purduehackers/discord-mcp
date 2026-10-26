import type { REST } from "@discordjs/rest";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  Routes,
  type RESTPostAPIGuildStickerFormDataBody,
  type RESTPatchAPIGuildStickerJSONBody,
} from "discord-api-types/v10";

import type { discordResult } from "../../server";
import * as schemas from "./schemas";

/** List a guild's stickers and formats.. */
export function listStickers(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "list_stickers",
    {
      description: "List a guild's stickers and formats.",
      inputSchema: schemas.guildInput,
      outputSchema: schemas.stickerListOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.stickerListOutput, async () => {
        return {
          stickers: await rest.get(Routes.guildStickers(input.guild_id), {
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Upload a guild sticker from base64 bytes, up to 512 KiB. */
export function createSticker(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "create_sticker",
    {
      description:
        "Upload a guild sticker from base64 bytes, up to 512 KiB. Supply a filename matching its PNG, APNG, GIF, or JSON format.",
      inputSchema: schemas.createInput,
      outputSchema: schemas.stickerOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.stickerOutput, async () => {
        const { guild_id, file, reason, ...body } = input;
        return {
          sticker: await rest.post(Routes.guildStickers(guild_id), {
            body: body satisfies Omit<RESTPostAPIGuildStickerFormDataBody, "file">,
            appendToFormData: true,
            files: [
              {
                name: file.name,
                data: Buffer.from(file.data, "base64"),
                contentType: file.content_type,
                key: "file",
              },
            ],
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Change a guild sticker's name, description, or tags.. */
export function editSticker(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "edit_sticker",
    {
      description: "Change a guild sticker's name, description, or tags.",
      inputSchema: schemas.editInput,
      outputSchema: schemas.stickerOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) =>
      respond(schemas.stickerOutput, async () => {
        const { guild_id, sticker_id, reason, ...body } = input;
        return {
          sticker: await rest.patch(Routes.guildSticker(guild_id, sticker_id), {
            body: body satisfies RESTPatchAPIGuildStickerJSONBody,
            reason,
            signal: context.mcpReq.signal,
          }),
        };
      }),
  );
}

/** Delete a guild sticker.. */
export function deleteSticker(server: McpServer, rest: REST, respond: typeof discordResult) {
  server.registerTool(
    "delete_sticker",
    {
      description: "Delete a guild sticker.",
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
        await rest.delete(Routes.guildSticker(input.guild_id, input.sticker_id), {
          reason: input.reason,
          signal: context.mcpReq.signal,
        });
        return { success: true };
      }),
  );
}
