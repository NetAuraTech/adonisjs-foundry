import { useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import type { ResolvedBlock } from '#types/page'

const alignMap: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
}

interface RichTextBlockProps {
  block: ResolvedBlock<'rich_text'>
}

/**
 * Renders sanitised HTML from the CMS rich-text editor.
 *
 * Double-sanitisation strategy:
 * - Back-end: `isomorphic-dompurify` runs at save time in `PageService.update()`
 *   so only clean HTML ever reaches the database.
 * - Front-end: `DOMPurify` runs here at render time as a second line of defence
 *   against anything that may have bypassed the backend (data migrations, direct
 *   DB inserts, third-party content imports).
 *
 * The `prose` class (Tailwind Typography plugin) styles the HTML elements
 * produced by the editor (headings, lists, links, blockquotes, etc.).
 */
export default function RichTextBlock({ block }: RichTextBlockProps) {
  const { content, align } = block.props
  const ref = useRef<HTMLDivElement>(null)

  // Run DOMPurify after mount so it has access to the real DOM
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = DOMPurify.sanitize(content, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      })
    }
  }, [content])

  const alignClass = alignMap[align ?? 'left'] ?? 'text-left'

  return (
    <div ref={ref} className={`prose prose-neutral max-w-none dark:prose-invert ${alignClass}`} />
  )
}
