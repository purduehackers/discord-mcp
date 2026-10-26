import { z } from "zod";

// oxlint-disable-next-line rayhanadev/wrap-throwing-api -- Zod constructs a synchronous JSON schema without reading a response body.
export const jsonValueSchema = z.json();

export const credentialSchema = z.strictObject({
  token: z.string().trim().min(1),
  authPrefix: z.enum(["Bot", "Bearer"]).default("Bot"),
});

export const requestSchema = z.strictObject({
  route: z
    .templateLiteral(["/", z.string()])
    .refine(
      (route) => /^\/(?!\/)[^\s?#\\]+$/u.test(route),
      "Use a relative Discord API path without a query string.",
    )
    .describe(
      "Discord API v10 path, such as /channels/123/messages. Keep IDs as strings. Omit the API prefix.",
    ),
  query: z
    .record(z.string(), z.string())
    .optional()
    .describe("Query parameters, such as limit or before."),
  body: jsonValueSchema.optional().describe("Discord's JSON request body, unchanged."),
  reason: z.string().optional().describe("Reason for the Discord audit log."),
  files: z
    .array(
      z.strictObject({
        name: z.string().min(1),
        data: z.base64().describe("Base64-encoded file contents."),
        contentType: z.string().optional(),
        key: z
          .string()
          .optional()
          .describe("Optional multipart field name. Defaults to files[index]."),
      }),
    )
    .optional(),
  appendToFormData: z
    .boolean()
    .optional()
    .describe("Send body fields as multipart fields, as required for stickers."),
});
