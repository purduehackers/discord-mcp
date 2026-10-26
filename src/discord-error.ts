import { TaggedError } from "better-result";

/** Contains a diagnostic that can cross the MCP boundary without credentials. */
export class DiscordError extends TaggedError("DiscordError")<{ message: string }> {}
