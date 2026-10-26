import { DitherField } from "./dither-field";
import { DiscordMark, CheckMark, GliderMark } from "./ui";

/** Uses the same visual system as the launch video for the repository hero. */
export function Banner() {
  return (
    <div className="banner">
      <DitherField frame={42} />
      <div className="banner-copy">
        <div className="banner-brand">
          <GliderMark />
          <span>PURDUE HACKERS / DISCORD MCP</span>
        </div>
        <h1>
          Discord for
          <br />
          <span>your agent</span>
        </h1>
        <p>Use 78 tools with your Discord bot.</p>
        <div className="banner-credit">OPEN SOURCE / MIT LICENSE</div>
      </div>
      <div className="banner-preview">
        <div className="banner-window-title">
          <span className="agent-symbol">&gt;_</span>Codex
          <span className="status-dot" />
        </div>
        <div className="banner-prompt">Find the Mac face unlock app in #ship.</div>
        <div className="banner-tools">
          <div>
            <DiscordMark />
            Searched server messages
            <CheckMark />
          </div>
          <div>
            <DiscordMark />
            Read channel messages
            <CheckMark />
          </div>
          <div>
            <DiscordMark />
            Sent direct message
            <CheckMark />
          </div>
        </div>
        <div className="banner-clients">Codex · Claude Code · Cursor · Pi</div>
      </div>
    </div>
  );
}
