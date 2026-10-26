import { loadFont } from "@remotion/fonts";
import { Composition, Still, staticFile } from "remotion";

import { Banner } from "./banner";
import { DiscordDemo } from "./discord-demo";

import "./style.css";

await Promise.all([
  loadFont({ family: "PixelHackers", url: staticFile("PixelHackers.woff2") }),
  loadFont({ family: "Inconsolata", url: staticFile("Inconsolata.ttf"), weight: "200 900" }),
]);

/** Registers the shareable video and its matching repository banner. */
export function RemotionRoot() {
  return (
    <>
      <Composition
        id="DiscordMCP"
        component={DiscordDemo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Still id="Banner" component={Banner} width={1600} height={600} />
    </>
  );
}
