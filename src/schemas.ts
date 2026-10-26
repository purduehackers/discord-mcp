import { z } from "zod";

export const credentialSchema = z.strictObject({
  token: z.string().trim().min(1),
  authPrefix: z.enum(["Bot", "Bearer"]).default("Bot"),
});

export const snowflakeSchema = z
  .string()
  .regex(/^[0-9]{17,20}$/u)
  .describe("Discord snowflake ID, as a string.");
export const reasonSchema = z
  .string()
  .trim()
  .min(1)
  .max(512)
  .optional()
  .describe("Reason recorded in Discord's audit log.");
export const timestampSchema = z.iso.datetime({ offset: true });
export const imageSchema = z
  .string()
  .regex(/^data:image\/(?:png|jpeg|gif|webp);base64,[A-Za-z0-9+/]+={0,2}$/u)
  .describe("Base64 image data URI.");
export const permissionsSchema = z
  .string()
  .regex(/^[0-9]+$/u)
  .describe("Discord permissions bitfield as a decimal string.");
export const fileSchema = z.strictObject({
  name: z.string().min(1).max(255),
  data: z.base64().describe("Base64-encoded file bytes."),
  content_type: z.string().min(1).optional(),
});
export const successSchema = z.strictObject({ success: z.literal(true) });
