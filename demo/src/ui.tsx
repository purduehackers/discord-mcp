/** @fileoverview Shared artwork keeps the banner and video visually consistent. */
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import type { MessageProps, RevealProps, ShellProps, ToolRowProps } from "./demo.types";

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
      <path d="M41.2351 0C40.6164 1.09866 40.0607 2.2352 39.5556 3.397C34.7569 2.67719 29.8697 2.67719 25.0584 3.397C24.5658 2.2352 23.9976 1.09866 23.3788 0C18.8705 0.770324 14.4759 2.12155 10.3085 4.02841C2.04967 16.2652 -0.185531 28.1863 0.925755 39.9432C5.76238 43.517 11.1799 46.2447 16.951 47.9874C18.2517 46.2447 19.4009 44.3883 20.3859 42.4562C18.5169 41.7616 16.7111 40.8903 14.981 39.88C15.4356 39.5517 15.8776 39.2107 16.307 38.8824C26.4475 43.6559 38.1917 43.6559 48.3449 38.8824C48.7742 39.236 49.2162 39.577 49.6708 39.88C47.9408 40.9029 46.1349 41.7616 44.2533 42.4688C45.2383 44.4009 46.3875 46.2573 47.6882 48C53.4593 46.2573 58.8768 43.5422 63.7134 39.9684C65.0268 26.3299 61.4656 14.5099 54.3054 4.04104C50.1507 2.13418 45.7561 0.782952 41.2478 0.0252565L41.2351 0ZM21.8003 32.7072C18.6811 32.7072 16.0923 29.8785 16.0923 26.3804C16.0923 22.8824 18.5801 20.041 21.7876 20.041C24.9952 20.041 27.5461 22.895 27.4956 26.3804C27.4451 29.8658 24.9826 32.7072 21.8003 32.7072ZM42.8389 32.7072C39.7071 32.7072 37.1436 29.8785 37.1436 26.3804C37.1436 22.8824 39.6314 20.041 42.8389 20.041C46.0465 20.041 48.5848 22.895 48.5343 26.3804C48.4838 29.8658 46.0213 32.7072 42.8389 32.7072Z" />
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

/** Identifies sample content throughout the staged workflow. */
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
        <span>Illustrative workflow · Sample messages</span>
      </footer>
    </div>
  );
}

/** Keeps fictional message styling separate from the agent interface. */
export function Message({
  name,
  initials,
  color,
  children,
  time = "Today at 10:24",
  bot = false,
}: MessageProps) {
  return (
    <div className="message">
      <div className="avatar" style={{ background: color }}>
        {bot ? <DiscordMark /> : initials}
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
