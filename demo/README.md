# Launch demo

Editable Remotion source for a 30-second, 1920 × 1080 video and the README banner.
The UI uses sample messages and a staged workflow. It does not connect to Discord.

```sh
cd demo
bun install
bun run dev
bun run render
bun run banner
```

The video exports to `out/discord-mcp.mp4`; the banner exports to `../.github/assets/banner.png`.
The design uses Purdue Hackers' glider, PixelHackers typeface by Jadden Picardal, and original interface sounds.
[PixelHackers](public/PixelHackers-LICENSE.txt) and [Inconsolata](public/Inconsolata-LICENSE.txt) retain their SIL Open Font Licenses.
