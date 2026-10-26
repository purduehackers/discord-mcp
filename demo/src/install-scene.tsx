import { interpolate, useCurrentFrame } from "remotion";

import { CodexHeader, TerminalPrompt, TerminalWindow } from "./terminal";
import { Reveal, SceneShell, ToolRow } from "./ui";

/** Shows credential setup as terminal output without exposing the token. */
export function InstallScene() {
  const frame = useCurrentFrame();
  const prompt = "Install github.com/purduehackers/discord-mcp";
  const typed = Math.floor(
    interpolate(frame, [15, 58], [0, prompt.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return (
    <SceneShell step="01 / CONNECT" title="Connect Discord to your agent">
      <Reveal delay={5} className="install-window">
        <TerminalWindow>
          <CodexHeader />
          <div className="user-prompt">
            <span className="prompt-caret">›</span>
            <span>
              {prompt.slice(0, typed)}
              <span className="typing-cursor" style={{ opacity: Number(frame < 66) }} />
            </span>
          </div>
          <div className="tool-stack">
            <ToolRow delay={70} detail="Read bot token from local environment">
              Configured Discord MCP
            </ToolRow>
            <ToolRow delay={94} detail="Wack Hacker · Purdue Hackers · 78 tools">
              Checked connection
            </ToolRow>
          </div>
          <Reveal delay={110} className="agent-answer">
            Discord is connected.
          </Reveal>
          <TerminalPrompt />
        </TerminalWindow>
      </Reveal>
      <Reveal delay={115} className="client-line">
        Codex <i /> Claude Code <i /> Cursor <i /> Pi <i /> and more
      </Reveal>
    </SceneShell>
  );
}
