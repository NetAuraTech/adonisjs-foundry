import type { ResolvedBlock } from '#types/page'

// ─── Tailwind maps ────────────────────────────────────────────────────────────

const alignMap = {
  left: { container: 'items-start text-left', cta: 'justify-start' },
  center: { container: 'items-center text-center', cta: 'justify-center' },
  right: { container: 'items-end text-right', cta: 'justify-end' },
}

const minHeightMap = {
  auto: 'min-h-0',
  sm: 'min-h-[300px]',
  md: 'min-h-[500px]',
  lg: 'min-h-[700px]',
  screen: 'min-h-screen',
}

const backgroundMap: Record<string, string> = {
  'canvas': 'bg-canvas',
  'surface': 'bg-surface',
  'sunken': 'bg-sunken',
  'primary-deep': 'bg-primary-deep',
  'primary-mid': 'bg-primary-mid',
  'primary-soft': 'bg-primary-soft',
  'transparent': 'bg-transparent',
}

const variantMap: Record<string, string> = {
  primary: 'bg-primary-mid text-ink-inverted hover:bg-primary-deep',
  secondary: 'bg-surface border border-edge text-ink hover:bg-sunken',
  ghost: 'text-primary-mid hover:underline',
}

// ─────────────────────────────────────────────────────────────────────────────

interface HeroBlockProps {
  block: ResolvedBlock<'hero'>
}

/**
 * Full-width hero block with an optional background image, title, subtitle,
 * and a CTA button. Supports left / center / right alignment and multiple
 * min-height presets.
 */
export default function HeroBlock({ block }: HeroBlockProps) {
  const { title, subtitle, cta, image, align, background, minHeight } = block.props

  const alignment = alignMap[align] ?? alignMap.center
  const minHClass = minHeightMap[minHeight] ?? 'min-h-0'
  const bgClass = backgroundMap[background] ?? 'bg-canvas'

  return (
    <div
      className={`relative flex flex-col ${alignment.container} ${minHClass} ${bgClass} px-6 py-16 md:px-12 md:py-24`}
    >
      {/* Background image */}
      {image && (
        <img
          src={image.url}
          alt={image.alt}
          className="absolute inset-0 h-full w-full object-cover opacity-30 pointer-events-none select-none"
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-ink md:text-5xl lg:text-6xl">
          {title}
        </h1>

        {subtitle && <p className="mt-4 text-lg text-ink-muted md:text-xl">{subtitle}</p>}

        {cta && (
          <div className={`mt-8 flex ${alignment.cta}`}>
            <a
              href={cta.href}
              className={`inline-flex items-center rounded-lg px-6 py-3 text-sm font-medium transition-colors ${variantMap[cta.variant] ?? variantMap.primary}`}
            >
              {cta.label}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
