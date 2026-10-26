import { useCurrentFrame, interpolate } from "remotion";

import { DitherField } from "./dither-field";
import { GliderMark, Reveal } from "./ui";

/** Establishes the product before the workflow starts. */
export function IntroScene() {
  const frame = useCurrentFrame();
  return (
    <div
      className="intro scene"
      style={{
        opacity: interpolate(frame, [78, 89], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <DitherField frame={frame} />
      <Reveal delay={-24} className="intro-brand">
        <GliderMark />
        <span>PURDUE HACKERS PRESENTS</span>
      </Reveal>
      <h1>
        DISCORD
        <br />
        <span>FOR AGENTS.</span>
      </h1>
      <Reveal delay={14} className="intro-caption">
        Your bot. Any server. 78 tools.
      </Reveal>
      <div className="intro-credit">DISCORD MCP / OPEN SOURCE / BUILT AT PURDUE HACKERS</div>
    </div>
  );
}
