import { MACID } from "./scenario.constants";
import { DiscordMark, Message, Reveal, SceneShell, ToolRow } from "./ui";

/** Simulates an authorized DM without connecting the video to Discord. */
export function SendScene() {
  return (
    <SceneShell step="03 / SEND A DM" title="Send the project links to yourself">
      <div className="workflow-grid">
        <div className="panel agent-panel">
          <div className="window-bar">
            <span className="agent-symbol">&gt;_</span>Codex
            <span className="status-dot" />
          </div>
          <div className="agent-body">
            <Reveal delay={5} className="user-prompt">
              DM me the project and source code.
            </Reveal>
            <div className="tool-stack">
              <ToolRow delay={40}>Sent direct message</ToolRow>
            </div>
            <Reveal delay={70} className="agent-answer">
              <strong>Sent you both links.</strong>
              <p>I included akshith’s original post.</p>
              <div className="source-pill">
                <span>@</span> Wack Hacker <span>↗</span>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="panel discord-panel">
          <div className="window-bar discord-bar">
            <DiscordMark />
            <span>Direct messages</span>
          </div>
          <div className="channel-title">
            <span>@</span>Wack Hacker<span className="channel-description">Your Discord bot</span>
          </div>
          <div className="messages">
            <Reveal delay={48}>
              <Message
                name="Wack Hacker"
                initials=""
                color="#5865f2"
                avatar="wack-hacker.png"
                time="Now"
                bot
              >
                <strong>
                  {MACID.name} by {MACID.author}
                </strong>
                <p>Camera-based face unlock for macOS.</p>
                <div className="dm-links">
                  <span>Project</span>
                  <a href={MACID.website}>macid.akshith.io ↗</a>
                  <span>Source code</span>
                  <a href={MACID.repository}>github.com/akshithio/macid ↗</a>
                </div>
                <a className="source-pill" href={MACID.originalPost}>
                  <span>#</span> 🚢ship · Original post <span>↗</span>
                </a>
              </Message>
            </Reveal>
          </div>
        </div>
      </div>
    </SceneShell>
  );
}
