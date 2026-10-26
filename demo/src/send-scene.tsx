import { DiscordMark, Message, Reveal, SceneShell, ToolRow } from "./ui";

/** Makes the user's explicit send request visible before the write action. */
export function SendScene() {
  return (
    <SceneShell step="03 / TAKE ACTION" title="Then keep everyone in the loop.">
      <div className="workflow-grid">
        <div className="panel agent-panel">
          <div className="window-bar">
            <span className="agent-symbol">&gt;_</span>Your agent
            <span className="status-dot" />
          </div>
          <div className="agent-body">
            <Reveal delay={5} className="user-prompt">
              Post a quick recap in #updates.
            </Reveal>
            <div className="tool-stack">
              <ToolRow delay={40} detail="#updates">
                Sent message
              </ToolRow>
            </div>
            <Reveal delay={70} className="agent-answer">
              <strong>Posted to #updates.</strong>
              <p>Everyone has the next steps.</p>
              <div className="source-pill">
                <span>#</span> updates <span>↗</span>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="panel discord-panel">
          <div className="window-bar discord-bar">
            <DiscordMark />
            <span>Demo workspace</span>
          </div>
          <div className="channel-title">
            <span>#</span>updates<span className="channel-description">Keep the team in sync</span>
          </div>
          <div className="messages">
            <Reveal delay={48}>
              <Message name="Your bot" initials="" color="#5865f2" time="Just now" bot>
                <strong>Launch recap</strong>
                <p>The API is ready. Two things left:</p>
                <div className="discord-list">
                  • Publish the install guide
                  <br />• Finish the demo video
                </div>
                <p className="channel-link">#launch ↗</p>
              </Message>
            </Reveal>
          </div>
          <Reveal delay={85} className="result-caption">
            <span className="result-dot" />
            Sent with your bot
          </Reveal>
        </div>
      </div>
    </SceneShell>
  );
}
