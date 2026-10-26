/** @fileoverview Splits text before sending, preserving Unicode and fenced code across Discord messages. */
import { Result } from "better-result";

import { DiscordError } from "./errors";

/** Bounds every chunk at 2,000 UTF-16 units, including fences added around continued code. */
export function splitMessage(content: string, maxChunks: number): Result<string[], DiscordError> {
  const chunks: string[] = [];
  let fence: { marker: string; opening: string } | undefined;
  let prefix = "";
  let body = "";

  /** Closes and reopens code fences without discarding any source text. */
  function flush() {
    if (!body) return;
    chunks.push(prefix + body + closingFence(fence?.marker, body));
    prefix = fence ? fence.opening + "\n" : "";
    body = "";
  }

  /** Splits oversized lines while reserving room for fence continuation. */
  function writeText(text: string): Result<void, DiscordError> {
    let remaining = text;
    while (remaining) {
      const suffix = closingFence(fence?.marker, body + remaining);
      if (prefix.length + body.length + remaining.length + suffix.length <= 2000) {
        body += remaining;
        break;
      }
      const continuation = fence ? fence.opening + "\n" : "";
      if (body && continuation.length + remaining.length + suffix.length <= 2000) {
        flush();
        continue;
      }
      // Reserve a newline before the closing fence even when this cut ends inside a line.
      const capacity = 2000 - prefix.length - body.length - (fence ? fence.marker.length + 1 : 0);
      if (capacity < 2) {
        if (!body)
          return Result.err(
            new DiscordError({
              message: "The code fence leaves no room for message content.",
              hint: "Shorten the fence marker or language header before sending.",
            }),
          );
        flush();
        continue;
      }
      const cut = splitPosition(remaining, capacity);
      body += remaining.slice(0, cut);
      remaining = remaining.slice(cut);
      flush();
    }
    return Result.ok(undefined);
  }

  for (const line of content.split(/(?<=\n)/u)) {
    const marker = /^ {0,3}(`{3,}|~{3,})([^\r\n]*)(?:\r?\n)?$/u.exec(line);
    const opening = !fence && marker && !(marker[1].startsWith("`") && marker[2].includes("`"));
    const closing =
      fence &&
      marker &&
      marker[1][0] === fence.marker[0] &&
      marker[1].length >= fence.marker.length &&
      !marker[2].trim();
    if (opening || closing) {
      const nextFence = opening
        ? { marker: marker[1], opening: line.replace(/\r?\n$/u, "") }
        : undefined;
      if ((prefix + body + line + closingFence(nextFence?.marker, line)).length > 2000) flush();
      if ((prefix + line + closingFence(nextFence?.marker, line)).length > 2000)
        return Result.err(
          new DiscordError({
            message: "A code fence header is too long to fit in a Discord message.",
            hint: "Shorten the fence marker or language header before sending.",
          }),
        );
      body += line;
      fence = nextFence;
      continue;
    }

    const written = writeText(line);
    if (written.isErr()) return written;
  }
  flush();
  if (!chunks.length || chunks.some((part) => !part.trim()))
    return Result.err(
      new DiscordError({
        message: "The content produces an empty or whitespace-only message.",
        hint: "Remove long runs of whitespace before sending.",
      }),
    );
  if (chunks.length > maxChunks)
    return Result.err(
      new DiscordError({
        message: `The content needs ${chunks.length} messages, exceeding max_chunks=${maxChunks}.`,
        hint: "Shorten the content or increase max_chunks, up to 20. Nothing was sent.",
      }),
    );
  return Result.ok(chunks);
}

/** Prefers a word boundary but does not split a Unicode surrogate pair. */
function splitPosition(text: string, capacity: number): number {
  let cut = Math.min(text.length, capacity);
  const space = text.lastIndexOf(" ", cut - 1);
  if (space >= capacity / 2) cut = space + 1;
  const last = text.charCodeAt(cut - 1);
  if (last >= 0xd800 && last <= 0xdbff) cut -= 1;
  return cut;
}

/** Reserves fence syntax only when a chunk ends inside a code block. */
function closingFence(marker: string | undefined, text: string): string {
  return marker ? (text.endsWith("\n") ? "" : "\n") + marker : "";
}
