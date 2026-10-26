/** @fileoverview Explicit scene boundaries keep the launch demo easy to retime. */
import { AbsoluteFill, Sequence } from "remotion";

import { InstallScene } from "./install-scene";
import { IntroScene } from "./intro-scene";
import { OutroScene } from "./outro-scene";
import { SearchScene } from "./search-scene";
import { SendScene } from "./send-scene";
import { Soundtrack } from "./soundtrack";

/** Keeps the staged workflow independent of live Discord accounts. */
export function DiscordDemo() {
  return (
    <AbsoluteFill className="video">
      <Soundtrack />
      <Sequence name="Meet Discord MCP" durationInFrames={90}>
        <IntroScene />
      </Sequence>
      <Sequence name="Install with your agent" from={90} durationInFrames={180}>
        <InstallScene />
      </Sequence>
      <Sequence name="Find the conversation" from={270} durationInFrames={300}>
        <SearchScene />
      </Sequence>
      <Sequence name="Post a recap" from={570} durationInFrames={165}>
        <SendScene />
      </Sequence>
      <Sequence name="Get Discord MCP" from={735} durationInFrames={165}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
}
