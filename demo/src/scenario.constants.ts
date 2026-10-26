export const MACID = {
  name: "MacID",
  author: "akshith",
  blog: "https://akshith.io/notes/macid",
  website: "https://macid.akshith.io",
  repository: "https://github.com/akshithio/macid",
  originalPost:
    "https://discord.com/channels/772576325897945119/904896819165814794/1559035157670010890",
  releasePost:
    "https://discord.com/channels/772576325897945119/904896819165814794/1563589124143710410",
};

export const MACID_ANNOUNCEMENT = [
  "I made an app that makes Face ID work pretty seamlessly on your Mac. The app isn't out yet cuz Apple Developers Program isn't letting me verify myself. But I wrote a blog post about it (my first!!) and the code is open source right now.",
  "I'd appreciate any feedback! Took a bunch of time to write. Will post again when the app is out and working",
];

export const MACID_EMBEDS = [
  {
    provider: "Akshith Garapati",
    title: "MacID: Bringing Face ID to the Mac",
    description:
      "How MacID unlocks your Mac with your face: hooking into the lock screen through PAM, recognizing you on device, and keeping your Keychain and password working.",
    url: MACID.blog,
    image: "macid-blog-preview.png",
  },
  {
    provider: "GitHub",
    title: "GitHub - akshithio/macid: Face unlock for the macOS lock screen.",
    description:
      "Face unlock for the macOS lock screen. . Contribute to akshithio/macid development by creating an account on GitHub.",
    url: MACID.repository,
  },
  {
    provider: "MacID",
    title: "MacID",
    description: "Face unlock for your Mac.",
    url: MACID.website,
  },
];

export const MACID_REACTIONS = [
  { emoji: "📚", count: 3 },
  { emoji: "💻", count: 3 },
  { emoji: "🎉", count: 4 },
  { emoji: "🔥", count: 3 },
];
