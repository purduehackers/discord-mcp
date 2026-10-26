import { Img, staticFile } from "remotion";

import type { DiscordWindowProps } from "./demo.types";
import { DiscordMark } from "./ui";

/** Keeps the conversation readable without recreating Discord's full navigation. */
export function DiscordWindow({ children, direct = false }: DiscordWindowProps) {
  return (
    <div className="discord-window">
      <div className="discord-header">
        {direct ? (
          <Img className="toolbar-avatar" src={staticFile("wack-hacker.png")} alt="" />
        ) : (
          <span className="channel-hash">#</span>
        )}
        <strong>{direct ? "Wack Hacker" : "🚢ship"}</strong>
        <div className="discord-context">
          <DiscordMark />
          <span>{direct ? "Direct message" : "Purdue Hackers"}</span>
        </div>
      </div>
      <div className="messages">{children}</div>
      <div className="discord-composer">Message {direct ? "@Wack Hacker" : "#🚢ship"}</div>
    </div>
  );
}
