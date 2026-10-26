import { DitherField } from "./dither-field";
import { CodexHeader, TerminalWindow } from "./terminal";
import { GliderMark, ToolRow } from "./ui";

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
        <p>Search conversations and send messages.</p>
        <div className="banner-credit">Open source · MIT license</div>
      </div>
      <div className="banner-preview">
        <TerminalWindow>
          <CodexHeader />
          <div className="user-prompt">
            <span className="prompt-caret">›</span>
            <span>Find the Mac face unlock app in #ship.</span>
          </div>
          <div className="tool-stack">
            <ToolRow delay={-24}>Searched server messages</ToolRow>
            <ToolRow delay={-24}>Read channel messages</ToolRow>
            <ToolRow delay={-24}>Sent direct message</ToolRow>
          </div>
        </TerminalWindow>
        <div className="banner-clients">Codex · Claude Code · Cursor · Pi</div>
      </div>
    </div>
  );
}
