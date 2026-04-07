import type { ResolvedBlock } from '#types/page'

const variantMap: Record<string, string> = {
  primary: 'bg-primary-mid text-ink-inverted hover:bg-primary-deep active:bg-primary-deep',
  secondary: 'bg-surface border border-edge text-ink hover:bg-sunken',
  ghost: 'text-primary-mid hover:underline underline-offset-4',
  danger: 'bg-danger text-ink-inverted hover:opacity-90',
}

const sizeMap: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-base',
}

const alignMap: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

interface ButtonCtaBlockProps {
  block: ResolvedBlock<'button_cta'>
}

/**
 * A standalone call-to-action button block.
 * Renders as an `<a>` tag so it works with any external or internal URL.
 */
export default function ButtonCtaBlock({ block }: ButtonCtaBlockProps) {
  const { label, href, variant, size, align, openInNewTab } = block.props

  const variantClass = variantMap[variant ?? 'primary'] ?? variantMap.primary
  const sizeClass = sizeMap[size ?? 'md'] ?? sizeMap.md
  const alignClass = alignMap[align ?? 'left'] ?? 'justify-start'

  return (
    <div className={`flex ${alignClass}`}>
      <a
        href={href}
        className={`inline-flex items-center rounded-lg font-medium transition-colors ${variantClass} ${sizeClass}`}
        {...(openInNewTab && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {label}
      </a>
    </div>
  )
}
