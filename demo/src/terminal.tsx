import { useCurrentFrame } from "remotion";

import type { TerminalWindowProps } from "./demo.types";

/** Recreates terminal chrome without adding controls to the rendered video. */
export function TerminalWindow({ children, className = "" }: TerminalWindowProps) {
  return (
    <div className={`terminal-window ${className}`}>
      <div className="terminal-titlebar">
        <span className="traffic-lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>codex · ~/purduehackers</span>
      </div>
      <div className="terminal-content">{children}</div>
    </div>
  );
}

/** Preserves the boxed session header used by the Codex command-line interface. */
export function CodexHeader() {
  return (
    <div className="codex-session">
      <strong>
        <span>&gt;_</span> OpenAI Codex
      </strong>
      <div>
        <span>directory:</span> ~/purduehackers
      </div>
    </div>
  );
}

/** Shows an idle prompt inside normal flow so terminal output cannot cover it. */
export function TerminalPrompt() {
  const frame = useCurrentFrame();
  return (
    <div className="terminal-idle">
      <div>
        <span className="prompt-caret">›</span>
        <span className="terminal-cursor" style={{ opacity: Number(frame % 30 < 18) }} />
      </div>
      <small>? for shortcuts</small>
    </div>
  );
}
