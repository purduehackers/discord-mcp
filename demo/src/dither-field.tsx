import type { DitherFieldProps } from "./demo.types";
import { BAYER, GLIDER } from "./dither.constants";

/** Uses ordered pixels so the glider stays crisp during deterministic rendering. */
export function DitherField({ frame = 0 }: DitherFieldProps) {
  let pixels = "";
  const phase = Math.floor(frame / 6) * 0.14;
  for (let row = 0; row < 135; row++) {
    for (let col = 0; col < 240; col++) {
      const x = col * 8;
      const y = row * 8;
      const inGlider = GLIDER.some(
        ([gx, gy]) =>
          x >= 1232 + gx * 160 && x < 1384 + gx * 160 && y >= 256 + gy * 160 && y < 408 + gy * 160,
      );
      const band = Math.max(0, (y - 800) / 280) * (0.11 + 0.1 * Math.sin(col * 0.045 + phase));
      const light = inGlider
        ? 0.24 + (0.61 * (Math.sin(col * 0.045 + row * 0.06 + phase) + 1)) / 2
        : band;
      if (light > (BAYER[(row % 4) * 4 + (col % 4)] + 0.5) / 16) pixels += `M${x},${y}h6v6h-6z`;
    }
  }
  return (
    <svg className="dither-field" viewBox="0 0 1920 1080" aria-hidden="true">
      <path d={pixels} fill="currentColor" />
    </svg>
  );
}
