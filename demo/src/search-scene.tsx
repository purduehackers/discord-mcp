import { interpolate, useCurrentFrame } from "remotion";

import { MACID } from "./scenario.constants";
import { DiscordMark, Message, Reveal, SceneShell, ToolRow } from "./ui";

/** Recreates a lookup using public posts from Purdue Hackers' ship channel. */
export function SearchScene() {
  const frame = useCurrentFrame();
  const prompt = "Find the Mac face unlock app in #ship.";
  const typed = Math.floor(
    interpolate(frame, [10, 48], [0, prompt.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return (
    <SceneShell step="02 / FIND A PROJECT" title="Find a project someone shipped">
      <div className="workflow-grid">
        <Reveal className="panel agent-panel">
          <div className="window-bar">
            <span className="agent-symbol">&gt;_</span>Codex
            <span className="status-dot" />
          </div>
          <div className="agent-body">
            <div className="user-prompt">
              {prompt.slice(0, typed)}
              <span className="typing-cursor" style={{ opacity: Number(frame < 52) }} />
            </div>
            <div className="tool-stack">
              <ToolRow delay={60} detail="#ship">
                Searched server messages
              </ToolRow>
              <ToolRow delay={95}>Read channel messages</ToolRow>
            </div>
            <Reveal delay={130} className="agent-answer">
              <strong>
                {MACID.name}, by {MACID.author}.
              </strong>
              <p>It adds camera-based face unlock to macOS. You can install it now.</p>
              <a className="answer-link" href={MACID.website}>
                macid.akshith.io ↗
              </a>
              <a className="source-pill" href={MACID.releasePost}>
                <span>#</span> 🚢ship <span>Oct 24 ↗</span>
              </a>
            </Reveal>
          </div>
        </Reveal>
        <Reveal delay={50} className="panel discord-panel">
          <div className="window-bar discord-bar">
            <DiscordMark />
            <span>Purdue Hackers</span>
            <span className="window-label">SERVER</span>
          </div>
          <div className="channel-title">
            <span>#</span>🚢ship<span className="channel-description">Share what you build</span>
          </div>
          <div className="messages search-messages">
            <Message
              name={MACID.author}
              initials="a"
              color="#596e56"
              avatar="akshith.png"
              time="Oct 11, 2026"
            >
              I made an app that makes Face ID work pretty seamlessly on your Mac.
              <a className="message-link" href={MACID.repository}>
                github.com/akshithio/macid
              </a>
            </Message>
            <Reveal delay={95}>
              <div className="date-divider">
                <span>October 24, 2026</span>
              </div>
              <Message
                name={MACID.author}
                initials="a"
                color="#596e56"
                avatar="akshith.png"
                time="12:24 PM"
              >
                Install works now!
                <a className="message-link" href={MACID.website}>
                  macid.akshith.io
                </a>
                <div className="project-embed">
                  <strong>{MACID.name}</strong>
                  <span>Camera-based face unlock</span>
                </div>
              </Message>
            </Reveal>
          </div>
          <Reveal delay={155} className="result-caption">
            <span className="result-dot" />
            Found the release and the original post
          </Reveal>
        </Reveal>
      </div>
    </SceneShell>
  );
}
