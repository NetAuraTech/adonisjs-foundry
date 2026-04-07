import React from 'react'
import { resolveResponsive } from '~/utils/responsive'
import type { ResolvedBlock, ResolvedSectionProps } from '#types/page'

// ─── Tailwind maps ────────────────────────────────────────────────────────────
// All classes must appear statically so the Tailwind compiler can detect them.

const paddingYMap = {
  none: { default: 'py-0', md: 'md:py-0', lg: 'lg:py-0' },
  sm: { default: 'py-4', md: 'md:py-4', lg: 'lg:py-6' },
  md: { default: 'py-8', md: 'md:py-10', lg: 'lg:py-12' },
  lg: { default: 'py-12', md: 'md:py-14', lg: 'lg:py-16' },
  xl: { default: 'py-16', md: 'md:py-20', lg: 'lg:py-24' },
}

const paddingXMap = {
  none: { default: 'px-0', md: 'md:px-0', lg: 'lg:px-0' },
  sm: { default: 'px-4', md: 'md:px-6', lg: 'lg:px-8' },
  md: { default: 'px-6', md: 'md:px-8', lg: 'lg:px-12' },
  lg: { default: 'px-8', md: 'md:px-12', lg: 'lg:px-16' },
  xl: { default: 'px-12', md: 'md:px-16', lg: 'lg:px-24' },
}

const maxWidthMap: Record<ResolvedSectionProps['maxWidth'], string> = {
  'sm': 'max-w-sm',
  'md': 'max-w-md',
  'lg': 'max-w-lg',
  'xl': 'max-w-xl',
  '2xl': 'max-w-2xl',
  'full': 'max-w-full',
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

// ─────────────────────────────────────────────────────────────────────────────

interface SectionBlockProps {
  block: ResolvedBlock<'section'>
  children?: React.ReactNode
}

/**
 * Wrapper block that defines the section's background, spacing, and max-width.
 * All visual child blocks are rendered inside this container.
 */
export default function SectionBlock({ block, children }: SectionBlockProps) {
  const { background, paddingY, paddingX, maxWidth, rounded } = block.props

  const pyClasses = resolveResponsive(paddingY, paddingYMap)
  const pxClasses = resolveResponsive(paddingX, paddingXMap)
  const bgClass = backgroundMap[background] ?? 'bg-canvas'
  const mwClass = maxWidthMap[maxWidth] ?? 'max-w-full'
  const roundedClass = rounded ? 'rounded-2xl overflow-hidden' : ''

  return (
    <section className={[bgClass, pyClasses, pxClasses, roundedClass].filter(Boolean).join(' ')}>
      <div className={`${mwClass} mx-auto w-full`}>{children}</div>
    </section>
  )
}
