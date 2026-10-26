import { interpolate, useCurrentFrame } from "remotion";

import { DiscordMark, Message, Reveal, SceneShell, ToolRow } from "./ui";

/** Links an agent answer to visible sample discussion. */
export function SearchScene() {
  const frame = useCurrentFrame();
  const prompt = "What’s left before launch? Check Discord.";
  const typed = Math.floor(
    interpolate(frame, [10, 48], [0, prompt.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return (
    <SceneShell step="02 / FIND CONTEXT" title="Find the conversation. Get the answer.">
      <div className="workflow-grid">
        <Reveal className="panel agent-panel">
          <div className="window-bar">
            <span className="agent-symbol">&gt;_</span>Your agent
            <span className="status-dot" />
          </div>
          <div className="agent-body">
            <div className="user-prompt">
              {prompt.slice(0, typed)}
              <span className="typing-cursor" style={{ opacity: Number(frame < 52) }} />
            </div>
            <div className="tool-stack">
              <ToolRow delay={65}>Searched server messages</ToolRow>
              <ToolRow delay={100}>Read channel messages</ToolRow>
            </div>
            <Reveal delay={150} className="agent-answer">
              <strong>Two things left:</strong>
              <p>
                <span className="list-number">1</span>Publish the install guide.
              </p>
              <p>
                <span className="list-number">2</span>Finish the demo video.
              </p>
              <div className="source-pill">
                <span>#</span> launch <span>↗</span>
              </div>
            </Reveal>
          </div>
        </Reveal>
        <Reveal delay={55} className="panel discord-panel">
          <div className="window-bar discord-bar">
            <DiscordMark />
            <span>Demo workspace</span>
          </div>
          <div className="channel-title">
            <span>#</span>launch<span className="channel-description">The final checklist</span>
          </div>
          <div className="messages">
            <Message name="Alex" initials="A" color="#4c507d">
              API is ready. What’s still blocking launch?
            </Message>
            <Reveal delay={85}>
              <Message name="Sam" initials="S" color="#596e56" time="Today at 10:26">
                Just the install guide and the demo video.
              </Message>
            </Reveal>
            <Reveal delay={120}>
              <Message name="Alex" initials="A" color="#4c507d" time="Today at 10:27">
                Perfect. Let’s get those across the line.
              </Message>
            </Reveal>
          </div>
          <Reveal delay={165} className="result-caption">
            <span className="result-dot" />
            Context from your server
          </Reveal>
        </Reveal>
      </div>
    </SceneShell>
  );
}
