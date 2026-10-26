import { Routes, type RESTPostAPIGuildStickerFormDataBody } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";

import { discordRequest } from "../lib/discord";
import * as schemas from "../lib/schemas/stickers.schemas";

export const schema = schemas.createInput.shape;
export const outputSchema = schemas.stickerOutput.shape;
export const metadata = {
  name: "create_sticker",
  description:
    "Upload a guild sticker from base64 bytes, up to 512 KiB. Supply a filename matching its PNG, APNG, GIF, or JSON format.",
  annotations: {
    title: "Upload a sticker",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Uploading a sticker…",
    "openai/toolInvocation/invoked": "Sticker uploaded",
    "anthropic/searchHint": "upload add a custom Discord server sticker",
  },
} satisfies ToolMetadata;

/** Upload a guild sticker from base64 bytes, up to 512 KiB. */
export default function createSticker(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.createInput, schemas.stickerOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    request: async (input, rest, signal) => {
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
          signal,
        }),
      };
    },
  });
}
