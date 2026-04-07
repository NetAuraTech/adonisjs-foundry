import type { ResolvedBlock } from '#types/page'

const spacingMap: Record<string, string> = {
  sm: 'my-4',
  md: 'my-8',
  lg: 'my-12',
  xl: 'my-16',
}

const styleMap: Record<string, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
  none: 'border-none',
}

const colorMap: Record<string, string> = {
  'default': 'border-edge',
  'strong': 'border-edge-strong',
  'primary': 'border-primary-mid',
  'primary-soft': 'border-primary-soft',
  'transparent': 'border-transparent',
}

interface SeparatorBlockProps {
  block: ResolvedBlock<'separator'>
}

/**
 * A simple horizontal rule with configurable style, spacing, and colour.
 */
export default function SeparatorBlock({ block }: SeparatorBlockProps) {
  const { style, spacing, color } = block.props

  const spacingClass = spacingMap[spacing ?? 'md'] ?? 'my-8'
  const styleClass = styleMap[style ?? 'solid'] ?? 'border-solid'
  const colorClass = colorMap[color ?? 'default'] ?? 'border-edge'

  if (style === 'none') {
    return <div className={spacingClass} aria-hidden="true" />
  }

  return (
    <hr className={`${spacingClass} border-t ${styleClass} ${colorClass}`} aria-hidden="true" />
  )
}
