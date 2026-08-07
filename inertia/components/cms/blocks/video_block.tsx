import type { ResolvedBlock, MediaAspect } from '#cms/types/page'
import { sanitizeHtml } from '~/components/cms/utils/purify'
import { resolveResponsive } from '~/components/cms/utils/responsive'

interface VideoBlockProps {
  block: ResolvedBlock<'video'>
}

/**
 * Maps a `MediaAspect` value to a stable aspect-ratio container class so the
 * embed reserves its space before load (no layout shift / CLS).
 * Statically defined so Tailwind's compiler sees every class.
 */
const aspectMap: Record<MediaAspect, Record<'default', string>> = {
  '16:9': { default: 'aspect-video' },
  '4:3': { default: 'aspect-4/3' },
  '1:1': { default: 'aspect-square' },
}

/**
 * Renders a video block: either a provider embed (YouTube / Vimeo via a
 * sandboxed iframe) or a direct media file via the native `<video>` element.
 *
 * The server resolver has already classified the URL — `embedUrl` is set for
 * provider embeds, `url` for direct files, both `null` when the embed policy
 * rejected the source. The block renders nothing when there is no playable
 * source.
 */
export default function VideoBlock({ block }: VideoBlockProps) {
  const { kind, url, embedUrl, poster, caption, aspect, className } = block.props

  // No playable source (empty or rejected by the embed policy) — render nothing
  if (kind !== 'embed' && kind !== 'file') return null
  if (kind === 'embed' && !embedUrl) return null
  if (kind === 'file' && !url) return null

  const aspectClasses = resolveResponsive(aspect, aspectMap) || 'aspect-video'
  const safeCaption = caption ? sanitizeHtml(caption) : ''

  const media =
    kind === 'embed' ? (
      <iframe
        src={embedUrl!}
        title="Embedded video"
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        // Sandboxed embed: no top-navigation, no popups
        sandbox="allow-scripts allow-same-origin allow-presentation"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    ) : (
      <video
        src={url!}
        poster={poster?.url}
        controls
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
    )

  return (
    <figure className={className}>
      <div className={`relative w-full overflow-hidden ${aspectClasses}`}>{media}</div>
      {safeCaption ? (
        <figcaption
          className="mt-2 text-sm text-ink-muted"
          // Caption is sanitized by sanitizeHtml (defence-in-depth on top of
          // the server-side save-time sanitization).
          dangerouslySetInnerHTML={{ __html: safeCaption }}
        />
      ) : null}
    </figure>
  )
}
