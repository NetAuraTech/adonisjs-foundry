import type { ResolvedBlock, MediaAspect } from '#cms/types/page'
import { resolveResponsive } from '~/components/cms/utils/responsive'

interface IframeBlockProps {
  block: ResolvedBlock<'iframe'>
}

const aspectMap: Record<MediaAspect, Record<'default', string>> = {
  '16:9': { default: 'aspect-video' },
  '4:3': { default: 'aspect-4/3' },
  '1:1': { default: 'aspect-square' },
}

/**
 * Renders a sandboxed embed iframe for allowlisted external content (maps,
 * calendars, forms…). The server resolver has already enforced the hostname
 * allowlist — `url` is `null` when rejected, in which case the block renders
 * nothing.
 */
export default function IframeBlock({ block }: IframeBlockProps) {
  const { url, title, aspect, className } = block.props

  // URL missing or rejected by the allowlist — render nothing
  if (!url) return null

  const aspectClasses = resolveResponsive(aspect, aspectMap) || 'aspect-video'

  return (
    <div
      className={['relative w-full overflow-hidden', aspectClasses, className]
        .filter(Boolean)
        .join(' ')}
    >
      <iframe
        src={url}
        title={title || 'Embedded content'}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        // Sandboxed embed: no top-navigation, no popups, no forms by default
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  )
}
