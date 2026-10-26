import { DiscordWindow } from "./discord-window";
import { MACID } from "./scenario.constants";
import { CodexHeader, TerminalPrompt, TerminalWindow } from "./terminal";
import { Message, Reveal, SceneShell, ToolRow } from "./ui";

/** Simulates an authorized DM without connecting the video to Discord. */
export function SendScene() {
  return (
    <SceneShell step="03 / SEND A DM" title="Send the project links to yourself">
      <div className="workflow-grid">
        <TerminalWindow>
          <CodexHeader />
          <Reveal delay={5} className="user-prompt">
            <span className="prompt-caret">›</span>
            <span>DM me the project and source code.</span>
          </Reveal>
          <div className="tool-stack">
            <ToolRow delay={40} detail="Sent through Wack Hacker">
              Sent direct message
            </ToolRow>
          </div>
          <Reveal delay={70} className="agent-answer">
            <strong>Sent you both links.</strong>
            <p>I included akshith’s original post.</p>
          </Reveal>
          <TerminalPrompt />
        </TerminalWindow>
        <DiscordWindow direct>
          <Reveal delay={48}>
            <Message
              name="Wack Hacker"
              initials=""
              color="#5865f2"
              avatar="wack-hacker.png"
              time="Today at 12:25 PM"
              bot
            >
              <strong>
                {MACID.name} by {MACID.author}
              </strong>
              <p>Camera-based face unlock for macOS.</p>
              <div className="dm-links">
                <span>Project</span>
                <a href={MACID.website}>macid.akshith.io</a>
                <span>Source code</span>
                <a href={MACID.repository}>github.com/akshithio/macid</a>
              </div>
              <a className="source-pill" href={MACID.originalPost}>
                # 🚢ship · Original post
              </a>
            </Message>
          </Reveal>
        </DiscordWindow>
      </div>
    </SceneShell>
  );
}
