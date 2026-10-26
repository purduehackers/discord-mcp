import { interpolate, useCurrentFrame } from "remotion";

import { DiscordWindow } from "./discord-window";
import { MACID } from "./scenario.constants";
import { CodexHeader, TerminalPrompt, TerminalWindow } from "./terminal";
import { Message, Reveal, SceneShell, ToolRow } from "./ui";

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
        <Reveal>
          <TerminalWindow>
            <CodexHeader />
            <div className="user-prompt">
              <span className="prompt-caret">›</span>
              <span>
                {prompt.slice(0, typed)}
                <span className="typing-cursor" style={{ opacity: Number(frame < 52) }} />
              </span>
            </div>
            <div className="tool-stack">
              <ToolRow delay={60} detail="2 matches in #ship">
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
                macid.akshith.io
              </a>
              <a className="terminal-source" href={MACID.releasePost}>
                Source: #ship · Oct 24
              </a>
            </Reveal>
            <TerminalPrompt />
          </TerminalWindow>
        </Reveal>
        <Reveal delay={50}>
          <DiscordWindow>
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
              </Message>
            </Reveal>
          </DiscordWindow>
        </Reveal>
      </div>
    </SceneShell>
  );
}
