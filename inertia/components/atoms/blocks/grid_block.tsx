import { resolveResponsive } from '~/utils/responsive'
import type { ResolvedBlock } from '#types/page'

// ─── Tailwind maps ────────────────────────────────────────────────────────────
// All classes listed statically for the Tailwind compiler.

const colsMap = {
  1: { default: 'grid-cols-1', sm: 'sm:grid-cols-1', md: 'md:grid-cols-1', lg: 'lg:grid-cols-1' },
  2: { default: 'grid-cols-2', sm: 'sm:grid-cols-2', md: 'md:grid-cols-2', lg: 'lg:grid-cols-2' },
  3: { default: 'grid-cols-3', sm: 'sm:grid-cols-2', md: 'md:grid-cols-3', lg: 'lg:grid-cols-3' },
  4: { default: 'grid-cols-4', sm: 'sm:grid-cols-2', md: 'md:grid-cols-4', lg: 'lg:grid-cols-4' },
}

const gapMap = {
  none: { default: 'gap-0', md: 'md:gap-0', lg: 'lg:gap-0' },
  sm: { default: 'gap-2', md: 'md:gap-3', lg: 'lg:gap-4' },
  md: { default: 'gap-4', md: 'md:gap-6', lg: 'lg:gap-8' },
  lg: { default: 'gap-6', md: 'md:gap-8', lg: 'lg:gap-12' },
}

// ─────────────────────────────────────────────────────────────────────────────

interface GridBlockProps {
  block: ResolvedBlock<'grid'>
  children?: React.ReactNode
}

/**
 * CSS grid container block. Accepts responsive column counts and gaps.
 * On mobile, 2–4 column layouts collapse to 1 column and step up at `sm`/`md`.
 */
export default function GridBlock({ block, children }: GridBlockProps) {
  const { cols, gap } = block.props

  const colsClasses = resolveResponsive(cols, colsMap)
  const gapClasses = resolveResponsive(gap, gapMap)

  return <div className={`grid ${colsClasses} ${gapClasses}`}>{children}</div>
}
