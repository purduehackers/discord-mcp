import { useId } from "react";

import type { DitherFieldProps } from "./demo.types";
import { BAYER, DISCORD_PATH } from "./dither.constants";

/** Clips ordered pixels to Discord's silhouette while preserving the animated floor texture. */
export function DitherField({ frame = 0 }: DitherFieldProps) {
  const clipId = useId();
  let logoPixels = "";
  let floorPixels = "";
  const phase = Math.floor(frame / 6) * 0.14;
  for (let row = 0; row < 135; row++) {
    for (let col = 0; col < 240; col++) {
      const x = col * 8;
      const y = row * 8;
      const threshold = (BAYER[(row % 4) * 4 + (col % 4)] + 0.5) / 16;
      const pixel = `M${x},${y}h6v6h-6z`;
      const band = Math.max(0, (y - 800) / 280) * (0.11 + 0.1 * Math.sin(col * 0.045 + phase));
      if (band > threshold) floorPixels += pixel;
      const light = 0.32 + (0.53 * (Math.sin(col * 0.045 + row * 0.06 + phase) + 1)) / 2;
      if (x >= 1200 && x < 1776 && y >= 280 && y < 704 && light > threshold) logoPixels += pixel;
    }
  }
  return (
    <svg className="dither-field" viewBox="0 0 1920 1080" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d={DISCORD_PATH} transform="translate(1200 280) scale(8.8)" />
        </clipPath>
      </defs>
      <path d={logoPixels} fill="currentColor" clipPath={`url(#${clipId})`} />
      <path d={floorPixels} fill="currentColor" />
    </svg>
  );
}
