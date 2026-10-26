/** @fileoverview Keeps Discord diagnostics actionable without exposing credentials or request bodies. */
import { DiscordAPIError, HTTPError, RateLimitError } from "@discordjs/rest";
import type { CallToolResult } from "@modelcontextprotocol/server";
import { TaggedError } from "better-result";

// oxlint-disable-next-line rayhanadev/errors-file-organization -- TaggedError requires a factory to construct the typed error superclass.
const BaseDiscordError = TaggedError("DiscordError")<{
  message: string;
  code?: number | string;
  status?: number;
  hint?: string;
  retry_after?: number;
  progress?: {
    sent_messages: { id: string; channel_id: string; chunk_index: number }[];
    next_chunk_index: number;
    total_chunks: number;
    delivery_uncertain: boolean;
  };
}>;

/** Contains a diagnostic that can cross the MCP boundary without credentials. */
export class DiscordError extends BaseDiscordError {
  /** Preserves Discord's API diagnostic while excluding request headers and token values. */
  static from(this: void, error: unknown): DiscordError {
    if (error instanceof DiscordError) return error;
    if (error instanceof DiscordAPIError)
      return new DiscordError({
        message: error.message,
        code: error.code,
        status: error.status,
        hint: DiscordError.apiHint(error),
      });
    if (error instanceof RateLimitError)
      return new DiscordError({
        message: "Discord rate limited this request.",
        status: 429,
        retry_after: error.retryAfter / 1000,
        hint: "Wait for retry_after seconds before retrying.",
      });
    if (error instanceof HTTPError)
      return new DiscordError({
        message: "Discord returned HTTP " + error.status,
        status: error.status,
        hint: DiscordError.httpHint(error.status),
      });
    return new DiscordError({
      message: "Discord request failed or was cancelled.",
      hint: "Check the connection. Before retrying a write, check whether Discord already applied it.",
    });
  }

  /** Exposes only diagnostic fields that callers can use to recover. */
  diagnostic() {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
      hint: this.hint,
      retry_after: this.retry_after,
      progress: this.progress,
    };
  }

  /** Marks failures as MCP errors so clients do not display a success summary. */
  toToolResult(): CallToolResult {
    return {
      isError: true,
      content: [
        { type: "text", text: [this.message, this.hint].filter(Boolean).join(" ") },
        { type: "text", text: JSON.stringify(this.diagnostic()) },
      ],
    };
  }

  /** Suggests checks without claiming that an ambiguous Discord error has one known cause. */
  private static apiHint(error: DiscordAPIError): string {
    switch (error.code) {
      case 50_001:
        return "Check the server and channel IDs, bot membership, ViewChannel, and private-thread membership. Run diagnose_connection with that scope.";
      case 50_007:
        return "Discord did not disclose the exact cause. Check the recipient ID, shared server, privacy settings, and whether the recipient blocked the bot.";
      case 50_278:
        return "The bot and recipient must share a server before the bot can send this DM.";
      case 50_013:
        return DiscordError.permissionHint(error);
      case 50_014:
      case 50_025:
        return DiscordError.httpHint(401);
      case 50_026:
        return "Authorize a Discord OAuth token with the endpoint's required scopes, or use a bot token for bot operations.";
      case 50_005:
        return "Only the original author can edit a message. Use the token that sent it.";
      case 50_034:
        return "Bulk deletion only accepts messages less than 14 days old. Delete older messages individually.";
      case 50_083:
      case 160_005:
        return "Check the thread's archived and locked state. Unarchive it with edit_thread; unlocking requires ManageThreads.";
      case 160_014:
        return "Enable the application's Message Content intent and check ViewChannel and ReadMessageHistory on the source channel.";
      case 160_002:
      case 160_009:
        return "Grant ReadMessageHistory on the referenced message's channel.";
      case 40_058:
        return "Create a forum post with create_thread, then send messages in that thread.";
      case 50_035:
        return "Correct the fields identified by Discord. Check field lengths, ID types, and supported channel or message types.";
      case 10_003:
      case 10_004:
      case 10_007:
      case 10_008:
        return "Check the resource ID and scope. It may have been deleted or may be inaccessible to this token.";
      default:
        return DiscordError.httpHint(error.status);
    }
  }

  /** Uses the failed route to make permission guidance specific to the operation. */
  private static permissionHint(error: DiscordAPIError): string {
    if (error.url.includes("/roles"))
      return "Check ManageRoles and place the bot's highest role above the target role. Integration-managed roles cannot be assigned or edited manually.";
    if (error.url.includes("/members/") || error.url.includes("/bans"))
      return "Check the relevant KickMembers, BanMembers, ModerateMembers, or ManageNicknames permission and role hierarchy. The server owner cannot be moderated.";
    if (error.url.includes("/audit-logs")) return "Grant ViewAuditLog in the selected server.";
    if (error.url.includes("/messages/search"))
      return "Check ViewChannel and ReadMessageHistory in the searched channels, and enable the application's Message Content intent.";
    if (error.url.includes("/messages"))
      return "Check ViewChannel and ReadMessageHistory, plus SendMessages or SendMessagesInThreads for sends and ManageMessages for moderation. Channel overwrites can deny these permissions.";
    return "Run diagnose_connection for the selected server and channel. Check the operation's permissions, channel overwrites, and role hierarchy.";
  }

  /** Keeps token repair instructions scoped to the caller's integration. */
  private static httpHint(status: number): string {
    if (status === 401)
      return "Update your client's X-Discord-Token header or stdio DISCORD_TOKEN/DISCORD_BOT_TOKEN. Supply the raw token and use Bot or Bearer for its auth prefix.";
    if (status === 429) return "Wait for Discord's rate limit to reset before retrying.";
    if (status >= 500)
      return "Discord is temporarily unavailable. Before retrying a write, check whether Discord already applied it.";
    return "Check the request arguments and this token's access with diagnose_connection.";
  }
}
