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
  operation: {
    summary: string;
  } & (
    | { request: (input: z.output<I>, rest: REST, signal: AbortSignal) => Promise<unknown> }
    | {
        workflow: (
          input: z.output<I>,
          rest: REST,
          signal: AbortSignal,
        ) => Promise<Result<z.input<O>, DiscordError>>;
      }
  ),
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

  // Automatic retries of failed writes can duplicate messages after an uncertain response.
  const rest = new REST({
    version: "10",
    authPrefix: credentials.data.authPrefix,
    retries: 0,
  }).setToken(credentials.data.token);
  const response =
    "workflow" in operation
      ? await operation.workflow(parsedInput.data, rest, context.signal)
      : await Result.tryPromise({
          try: () => operation.request(parsedInput.data, rest, context.signal),
          catch: DiscordError.from,
        });
  if (response.isErr()) return response.error.toToolResult();
  const parsed = parseDiscordResponse(outputSchema, response.value);
  if (parsed.isErr()) return parsed.error.toToolResult();
  return {
    content: [
      {
        type: "text",
        text: `${operation.summary}.`,
        annotations: { audience: ["user"], priority: 1 },
      },
      { type: "text", text: JSON.stringify(parsed.value) },
    ],
    structuredContent: parsed.value,
  };
}

/** Validates intermediate responses before a later request uses their IDs or permissions. */
export async function discordCall<S extends z.ZodType>(
  schema: S,
  request: () => Promise<unknown>,
): Promise<Result<z.output<S>, DiscordError>> {
  const response = await Result.tryPromise({ try: request, catch: DiscordError.from });
  if (response.isErr()) return response;
  return parseDiscordResponse(schema, response.value);
}

/** Reports schema paths without including response data that may contain sensitive content. */
function parseDiscordResponse<S extends z.ZodType>(
  schema: S,
  value: unknown,
): Result<z.output<S>, DiscordError> {
  const parsed = schema.safeParse(value);
  if (parsed.success) return Result.ok(parsed.data);
  return Result.err(
    new DiscordError({
      message:
        "Discord returned an unexpected response shape at " +
        parsed.error.issues
          .slice(0, 3)
          .map((issue) => issue.path.join("."))
          .join(", ") +
        ".",
      hint: "Report the schema paths to the server maintainer. Before retrying a write, check whether Discord already applied it.",
    }),
  );
}
