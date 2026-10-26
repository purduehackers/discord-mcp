/** @fileoverview Validates Discord arguments and results with credentials scoped to each xmcp operation. */
import { REST } from "@discordjs/rest";
import type { CallToolResult } from "@modelcontextprotocol/server";
import { Result } from "better-result";
import type { ToolExtraArguments } from "xmcp";
import type { z } from "zod";

import { DiscordError } from "./errors";
import { credentialSchema } from "./schemas";

/** Preserves object refinements that xmcp's field schemas cannot express. */
export async function discordRequest<I extends z.ZodObject, O extends z.ZodObject>(
  inputSchema: I,
  outputSchema: O,
  input: z.input<I>,
  context: ToolExtraArguments,
  request: (input: z.output<I>, rest: REST, signal: AbortSignal) => Promise<unknown>,
): Promise<CallToolResult> {
  const parsedInput = inputSchema.safeParse(input);
  if (!parsedInput.success)
    return {
      isError: true,
      content: [
        { type: "text", text: parsedInput.error.issues.map((issue) => issue.message).join("; ") },
      ],
    };

  const credentials = credentialSchema.safeParse(
    context.requestInfo
      ? {
          token: context.requestInfo.headers["x-discord-token"],
          authPrefix: context.requestInfo.headers["x-discord-auth-prefix"],
        }
      : {
          token: process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN,
          authPrefix: process.env.DISCORD_AUTH_PREFIX,
        },
  );
  if (!credentials.success)
    return {
      isError: true,
      content: [{ type: "text", text: "Supply a Discord token and a Bot or Bearer auth prefix." }],
    };

  const response = await Result.tryPromise({
    try: () => {
      const rest = new REST({ version: "10", authPrefix: credentials.data.authPrefix }).setToken(
        credentials.data.token,
      );
      return request(parsedInput.data, rest, context.signal);
    },
    catch: DiscordError.from,
  });
  if (response.isErr())
    return { isError: true, content: [{ type: "text", text: response.error.message }] };
  const parsed = outputSchema.safeParse(response.value);
  if (!parsed.success)
    return {
      isError: true,
      content: [
        {
          type: "text",
          text:
            "Discord returned an unexpected response shape at " +
            parsed.error.issues
              .slice(0, 3)
              .map((issue) => issue.path.join("."))
              .join(", ") +
            ".",
        },
      ],
    };
  return {
    content: [{ type: "text", text: JSON.stringify(parsed.data) }],
    structuredContent: parsed.data,
  };
}
