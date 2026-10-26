/** @fileoverview Shared artwork keeps the banner and video visually consistent. */
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

import type { MessageProps, RevealProps, ShellProps, ToolRowProps } from "./demo.types";
import { DISCORD_PATH } from "./dither.constants";

/** Preserves the five-cell glider used across Purdue Hackers projects. */
export function GliderMark() {
  return (
    <svg viewBox="0 0 3 3" fill="currentColor" aria-label="Purdue Hackers">
      <path d="M1 0h1v1h1v2H2V2H1V0ZM0 2h1v1H0z" />
    </svg>
  );
}

/** Uses Discord's existing project artwork to preserve the product identity. */
export function DiscordMark() {
  return (
    <svg viewBox="0 0 65 48" fill="currentColor" aria-label="Discord">
      <path d={DISCORD_PATH} />
    </svg>
  );
}

/** Keeps completion states legible at social video sizes. */
export function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Uses frame time so previews and exports have identical motion. */
export function Reveal({ children, delay = 0, className, style }: RevealProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });
  return (
    <div
      className={className}
      style={{
        ...style,
        opacity: progress,
        translate: `0 ${interpolate(progress, [0, 1], [24, 0])}px`,
      }}
    >
      {children}
    </div>
  );
}

/** Matches the active voice labels exposed by the hosted tools. */
export function ToolRow({ children, delay = 0, detail }: ToolRowProps) {
  return (
    <Reveal delay={delay} className="tool-row">
      <span className="tool-logo">
        <DiscordMark />
      </span>
      <span>
        {children}
        {detail ? <small>{detail}</small> : undefined}
      </span>
      <span className="tool-check">
        <CheckMark />
      </span>
    </Reveal>
  );
}

/** Identifies the reconstructed interaction throughout the walkthrough. */
export function SceneShell({ children, step, title }: ShellProps) {
  return (
    <div className="scene">
      <header className="scene-header">
        <div className="wordmark">
          <GliderMark />
          <div>
            <span className="brand-by">PURDUE HACKERS</span>DISCORD MCP
          </div>
        </div>
        <span className="step">{step}</span>
      </header>
      <Reveal className="scene-title">{title}</Reveal>
      {children}
      <footer className="scene-footer">
        <span>OPEN SOURCE / PURDUEHACKERS / DISCORD-MCP</span>
        <span>Recreated interaction · Public #ship posts</span>
      </footer>
    </div>
  );
}

/** Preserves author identity in the reconstructed Discord conversation. */
export function Message({
  name,
  initials,
  color,
  avatar,
  children,
  time,
  bot = false,
}: MessageProps) {
  return (
    <div className="message">
      <div className="avatar" style={{ background: color }}>
        {avatar ? <Img src={staticFile(avatar)} /> : bot ? <DiscordMark /> : initials}
      </div>
      <div className="message-main">
        <div className="message-author">
          {name}
          {bot ? <span className="bot-badge">APP</span> : undefined}
          <time>{time}</time>
        </div>
        <div className="message-body">{children}</div>
      </div>
    </div>
  );
}
