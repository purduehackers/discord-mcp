import { Easing, interpolate, useCurrentFrame } from "remotion";

import { DiscordWindow } from "./discord-window";
import { MACID } from "./scenario.constants";
import { ShipConversation } from "./ship-conversation";
import { CodexHeader, TerminalPrompt, TerminalWindow } from "./terminal";
import { Reveal, SceneShell, ToolRow } from "./ui";

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
  const scrollOffset = interpolate(
    frame,
    [135, 165, 220, 250, 310, 345, 385, 415],
    [0, 367, 367, 800, 800, 1190, 1190, 1351],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut((progress) => Easing.cubic(progress)),
    },
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
            <Reveal delay={365} className="agent-answer">
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
          <DiscordWindow scrollOffset={scrollOffset}>
            <ShipConversation />
          </DiscordWindow>
        </Reveal>
      </div>
    </SceneShell>
  );
}
