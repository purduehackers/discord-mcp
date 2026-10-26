import { Img, staticFile } from "remotion";

import type { DiscordWindowProps } from "./demo.types";
import { DiscordMark } from "./ui";

/** Recreates Discord's navigation and composer around the source-backed messages. */
export function DiscordWindow({ children, direct = false }: DiscordWindowProps) {
  return (
    <div className="discord-window">
      <div className="discord-titlebar">
        <DiscordMark />
        <span>Discord</span>
      </div>
      <div className="discord-workspace">
        <div className="guild-rail" aria-hidden="true">
          <div className={`guild-icon discord-home ${direct ? "selected" : ""}`}>
            <DiscordMark />
          </div>
          <div className="guild-separator" />
          <div className={`guild-icon ${direct ? "" : "selected"}`}>
            <Img src={staticFile("purdue-hackers.png")} alt="" />
          </div>
          <div className="guild-icon add-server">+</div>
        </div>
        <div className="channel-sidebar">
          <div className="sidebar-header">
            {direct ? "Direct Messages" : "Purdue Hackers"}
            <span>⌄</span>
          </div>
          <div className="channel-list">
            {direct ? (
              <>
                <div className="sidebar-search">Find a conversation</div>
                <div className="sidebar-section">DIRECT MESSAGES</div>
                <div className="sidebar-dm selected">
                  <Img src={staticFile("wack-hacker.png")} alt="" />
                  <span>Wack Hacker</span>
                </div>
              </>
            ) : (
              <>
                <div className="sidebar-section">⌄ COMMUNITY</div>
                <div className="sidebar-channel">
                  <span>#</span> ⚡lounge
                </div>
                <div className="sidebar-channel">
                  <span>#</span> 💻code
                </div>
                <div className="sidebar-channel selected">
                  <span>#</span> 🚢ship
                </div>
              </>
            )}
          </div>
        </div>
        <div className="discord-chat">
          <div className="discord-toolbar">
            {direct ? (
              <Img className="toolbar-avatar" src={staticFile("wack-hacker.png")} alt="" />
            ) : (
              <span className="channel-hash">#</span>
            )}
            <strong>{direct ? "Wack Hacker" : "🚢ship"}</strong>
            {direct ? <span className="online-dot" /> : undefined}
            <div className="discord-toolbar-actions" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="m16 2 6 6-2 2-2-1-5 5 1 3-2 2-3-4-5 5-1-1 5-5-4-3 2-2 3 1 5-5-1-2z" />
              </svg>
              <div className="discord-search">
                Search{" "}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="10" cy="10" r="6" />
                  <path d="m15 15 6 6" />
                </svg>
              </div>
            </div>
          </div>
          <div className="messages">{children}</div>
          <div className="discord-composer">
            <span className="composer-add">+</span>
            <span>Message {direct ? "@Wack Hacker" : "#🚢ship"}</span>
            <svg
              className="composer-smile"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M8 14c1 4 7 4 8 0M8 8v2m8-2v2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
