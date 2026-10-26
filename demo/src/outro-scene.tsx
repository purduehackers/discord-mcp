import { useCurrentFrame } from "remotion";

import { DitherField } from "./dither-field";
import { GliderMark, Reveal } from "./ui";

/** Leaves the installation location on screen long enough to read. */
export function OutroScene() {
  const frame = useCurrentFrame();
  return (
    <div className="scene outro">
      <DitherField frame={frame} />
      <Reveal className="intro-brand">
        <GliderMark />
        <span>BUILT AT PURDUE HACKERS</span>
      </Reveal>
      <Reveal delay={4}>
        <h1>
          YOUR AGENT.
          <br />
          <span>YOUR DISCORD.</span>
        </h1>
      </Reveal>
      <Reveal delay={14} className="outro-caption">
        Open source. Public endpoint. Bring your bot.
      </Reveal>
      <Reveal delay={24} className="repo-cta">
        <span>↗</span> github.com/purduehackers/discord-mcp
      </Reveal>
      <Reveal delay={32} className="outro-note">
        Copy the install prompt from the README.
      </Reveal>
    </div>
  );
}
