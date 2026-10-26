import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";

/** Adds original interface sounds while keeping the demo usable on mute. */
export function Soundtrack() {
  return (
    <>
      {Array.from({ length: 15 }, (_, index) => (
        <Sequence
          key={`install-${index}`}
          name="Install keystroke"
          from={105 + index * 3}
          durationInFrames={2}
        >
          <Audio src={staticFile("audio/key.wav")} volume={0.75} />
        </Sequence>
      ))}
      {Array.from({ length: 13 }, (_, index) => (
        <Sequence
          key={`search-${index}`}
          name="Search keystroke"
          from={280 + index * 3}
          durationInFrames={2}
        >
          <Audio src={staticFile("audio/key.wav")} volume={0.75} />
        </Sequence>
      ))}
      <Sequence name="Connection chime" from={184} durationInFrames={15}>
        <Audio src={staticFile("audio/confirm.wav")} volume={0.7} />
      </Sequence>
      <Sequence name="Message chime" from={798} durationInFrames={15}>
        <Audio src={staticFile("audio/confirm.wav")} volume={0.7} />
      </Sequence>
    </>
  );
}
