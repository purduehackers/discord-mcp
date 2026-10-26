import { interpolate, useCurrentFrame } from "remotion";

import { CheckMark, DiscordMark, Reveal, SceneShell } from "./ui";

/** Shows setup without displaying credentials or implying an OAuth login. */
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
        <div className="window-bar">
          <span className="agent-symbol">&gt;_</span>Codex
          <span className="window-label">MCP SETUP</span>
        </div>
        <div className="install-content">
          <div className="prompt-box">
            <span className="prompt-caret">›</span>
            <span>
              {prompt.slice(0, typed)}
              <span className="typing-cursor" style={{ opacity: Number(frame < 66) }} />
            </span>
          </div>
          <Reveal delay={70} className="credential-row">
            <span>Use your own Discord bot</span>
            <code>DISCORD_BOT_TOKEN</code>
            <span className="masked-token">••••••••••••</span>
          </Reveal>
          <Reveal delay={94} className="connected-card">
            <div className="connected-logo">
              <DiscordMark />
            </div>
            <div>
              <strong>Discord connected</strong>
              <p>78 tools available to your agent</p>
            </div>
            <div className="connected-check">
              <CheckMark />
            </div>
          </Reveal>
        </div>
      </Reveal>
      <Reveal delay={115} className="client-line">
        Codex <i /> Claude Code <i /> Cursor <i /> Pi <i /> and more
      </Reveal>
    </SceneShell>
  );
}
