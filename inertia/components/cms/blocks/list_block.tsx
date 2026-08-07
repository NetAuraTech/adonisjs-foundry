import type { ResolvedBlock } from '#cms/types/page'
import { sanitizeHtml } from '~/components/cms/utils/purify'

interface ListBlockProps {
  block: ResolvedBlock<'list'>
}

/**
 * Renders a bulleted or ordered list. Each item may contain inline rich-text
 * HTML (bold, links…) — sanitized both at save time server-side and again
 * here at render time as defence-in-depth.
 */
export default function ListBlock({ block }: ListBlockProps) {
  const { ordered, items, className } = block.props

  const safeItems = (items ?? []).filter((item): item is string => typeof item === 'string')
  if (safeItems.length === 0) return null

  const Tag = ordered ? 'ol' : 'ul'
  const listStyle = ordered ? 'list-decimal' : 'list-disc'

  return (
    <Tag className={['space-y-1 pl-6 text-ink', listStyle, className].filter(Boolean).join(' ')}>
      {safeItems.map((item, i) => (
        <li
          key={i}
          // Sanitized via sanitizeHtml — only inline formatting survives.
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }}
        />
      ))}
    </Tag>
  )
}
