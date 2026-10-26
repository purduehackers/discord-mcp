import { DiscordAPIError, HTTPError } from "@discordjs/rest";
import { TaggedError } from "better-result";

// oxlint-disable-next-line rayhanadev/errors-file-organization -- TaggedError requires a factory to construct the typed error superclass.
const BaseDiscordError = TaggedError("DiscordError")<{ message: string }>;

/** Contains a diagnostic that can cross the MCP boundary without credentials. */
export class DiscordError extends BaseDiscordError {
  /** Preserves Discord's API diagnostic while excluding request headers and token values. */
  static from(this: void, error: unknown): DiscordError {
    return new DiscordError({
      message:
        error instanceof DiscordAPIError
          ? error.message
          : error instanceof HTTPError
            ? "Discord returned HTTP " + error.status
            : "Discord request failed or was cancelled.",
    });
  }
}
