import type { ResolvedBlock } from '#types/page'

const alignMap: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const colorMap: Record<string, string> = {
  'default': 'text-ink',
  'muted': 'text-ink-muted',
  'subtle': 'text-ink-subtle',
  'primary': 'text-primary-mid',
  'primary-deep': 'text-primary-deep',
  'accent': 'text-accent-mid',
}

const sizeMap: Record<number, string> = {
  1: 'text-4xl md:text-5xl font-bold tracking-tight',
  2: 'text-3xl md:text-4xl font-bold tracking-tight',
  3: 'text-2xl md:text-3xl font-semibold',
  4: 'text-xl md:text-2xl font-semibold',
}

interface TitleBlockProps {
  block: ResolvedBlock<'title'>
}

/**
 * Renders a heading at levels 1–4 with configurable alignment and colour.
 * Reuses the semantic HTML heading element so the page outline stays correct.
 */
export default function TitleBlock({ block }: TitleBlockProps) {
  const { text, level, align, color } = block.props

  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'

  const classes = [
    sizeMap[level] ?? sizeMap[2],
    alignMap[align] ?? 'text-left',
    colorMap[color ?? 'default'] ?? 'text-ink',
  ].join(' ')

  return <Tag className={classes}>{text}</Tag>
}
