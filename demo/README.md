# Discord MCP video

Edit the 30s, 1920 × 1080 video and README banner with Remotion. The walkthrough recreates a search for MacID in Purdue Hackers’ #ship channel, followed by a simulated direct message through Wack Hacker.

The source posts are [akshith’s project announcement](https://discord.com/channels/772576325897945119/904896819165814794/1559035157670010890) and [install update](https://discord.com/channels/772576325897945119/904896819165814794/1563589124143710410). They also appear on the public [Purdue Hackers ship feed](https://ships.purduehackers.com/). The agent conversation, layout, link preview, and outgoing message are recreations. Rendering never connects to Discord or sends messages.

Start the editor from the repository root:

```sh
cd demo
bun install
bun run dev
```

Export the video and banner:

```sh
bun run render
bun run banner
```

The video exports to `out/discord-mcp.mp4`. The banner exports to `../.github/assets/banner.png`.

The design uses Purdue Hackers’ glider, a dithered Discord logo, PixelHackers by Jadden Picardal, and original interface sounds. The Discord avatars depict the original post’s author and the connected bot. [PixelHackers](public/PixelHackers-LICENSE.txt) and [Inconsolata](public/Inconsolata-LICENSE.txt) retain their SIL Open Font Licenses.
