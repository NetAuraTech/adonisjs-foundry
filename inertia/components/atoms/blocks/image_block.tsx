import type { ResolvedBlock } from '#types/page'

const fitMap: Record<string, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
}

interface ImageBlockProps {
  block: ResolvedBlock<'image'>
}

/**
 * Renders a single resolved image with optional caption.
 * When `fullWidth` is true the image stretches to fill its container;
 * otherwise it uses `width: auto` with a max-width constraint.
 */
export default function ImageBlock({ block }: ImageBlockProps) {
  const { file, caption, fit, rounded, fullWidth } = block.props

  if (!file) return null

  const fitClass = fitMap[fit] ?? 'object-cover'
  const roundedClass = rounded ? 'rounded-xl overflow-hidden' : ''
  const widthClass = fullWidth ? 'w-full' : 'max-w-full h-auto'

  return (
    <figure className={`${roundedClass} ${fullWidth ? 'w-full' : 'inline-block'}`}>
      <img src={file.url} alt={file.alt} className={`${widthClass} ${fitClass}`} />
      {caption && (
        <figcaption className="mt-2 text-sm text-ink-subtle text-center">{caption}</figcaption>
      )}
    </figure>
  )
}
