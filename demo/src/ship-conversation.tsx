import { Img, staticFile } from "remotion";

import type { DiscordLinkPreviewProps } from "./demo.types";
import { MACID, MACID_ANNOUNCEMENT, MACID_EMBEDS, MACID_REACTIONS } from "./scenario.constants";
import { Message } from "./ui";

/** Uses the original preview metadata and local copies of its artwork. */
function LinkPreview({
  provider,
  title,
  description,
  url,
  image,
  compact,
}: DiscordLinkPreviewProps) {
  return (
    <div className={`discord-link-preview ${compact ? "compact" : ""}`}>
      <div>
        <span className="preview-provider">{provider}</span>
        <a className="preview-title" href={url}>
          {title}
        </a>
        <p>{description}</p>
      </div>
      {image ? <Img className="preview-image" src={staticFile(image)} alt={title} /> : undefined}
    </div>
  );
}

/** Preserves the source posts and the reaction counts in the user's reference. */
export function ShipConversation() {
  return (
    <>
      <Message
        name={MACID.author}
        initials="a"
        color="#596e56"
        avatar="akshith.png"
        time="Oct 11, 2026 · 10:49 PM"
      >
        {MACID_ANNOUNCEMENT.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <div className="ship-links">
          <div>
            Blog Post: <a href={MACID.blog}>{MACID.blog}</a>
          </div>
          <div>
            GitHub: <a href={MACID.repository}>{MACID.repository}</a>
          </div>
          <div>
            Product Page (Install doesn’t work yet!): <a href={MACID.website}>{MACID.website}</a>{" "}
            <span className="message-edited">(edited)</span>
          </div>
        </div>
        {MACID_EMBEDS.map((embed) => (
          <LinkPreview key={embed.url} {...embed} />
        ))}
        <div className="message-reactions">
          {MACID_REACTIONS.map(({ emoji, count }) => (
            <span className="message-reaction" key={emoji}>
              <span>{emoji}</span> {count}
            </span>
          ))}
        </div>
      </Message>
      <div className="date-divider">
        <span>October 24, 2026</span>
      </div>
      <div className="message-reply">
        <span>↳</span> akshith <span>I made an app that makes Face ID work pretty seamlessly…</span>
      </div>
      <Message
        name={MACID.author}
        initials="a"
        color="#596e56"
        avatar="akshith.png"
        time="12:24 PM"
      >
        <p>
          Install works now! <a href={MACID.website}>{MACID.website}</a> to try it out and give me
          any feedback you have!
        </p>
        <a className="discord-video-preview" href={MACID.releasePost} aria-label="MacID demo video">
          <Img src={staticFile("macid-video-poster.jpg")} alt="MacID unlocks a Mac" />
          <span className="video-play" aria-hidden="true">
            ▶
          </span>
          <span className="video-duration">0:06</span>
        </a>
        <LinkPreview
          provider="MacID"
          title="MacID"
          description="Face unlock for your Mac. Wake it, press Return, and you are in."
          url={MACID.website}
          image="macid-site-preview.png"
          compact
        />
      </Message>
    </>
  );
}
