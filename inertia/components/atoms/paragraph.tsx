import { ReactNode } from 'react'
import type { FontSize } from '~/types/font'
import { getFontSizeClass } from '~/utils/font'

interface ParagraphProps {
  children: ReactNode
  /** Font size token. Defaults to `'base'`. */
  fs?: FontSize
  /**
   * Text color variant.
   *
   * - `'foreground'` — primary text color (`text-ink`), default.
   * - `'muted'` — secondary text color (`text-ink-muted`).
   * - `'error'` — danger text color (`text-danger`).
   * - `'custom'` — applies the class string passed in `color`.
   */
  variant?: 'foreground' | 'muted' | 'error' | 'custom'
  /**
   * Arbitrary Tailwind class(es) applied when `variant` is `'custom'`.
   * Ignored for all other variants.
   */
  color?: string
  /**
   * Top margin applied when the paragraph is not the first child of its
   * container.
   *
   * - `'xs'` — no margin.
   * - `'sm'` — `mt-2`.
   * - `'base'` — `mt-4`, default.
   * - `'xl'` — `mt-6`.
   */
  spacing?: 'xs' | 'sm' | 'base' | 'xl'
}

/**
 * Styled paragraph component.
 *
 * Wraps text content in a `<p>` tag with consistent line height, balanced
 * text wrapping, and optional spacing between sibling paragraphs. Use the
 * `variant` prop for semantic color roles and `spacing` to control vertical
 * rhythm within a content block.
 *
 * @example
 * <Paragraph>Standard body text.</Paragraph>
 * <Paragraph variant="muted" spacing="sm">Secondary description.</Paragraph>
 * <Paragraph variant="error">Validation failed.</Paragraph>
 * <Paragraph variant="custom" color="text-accent font-medium">Custom style.</Paragraph>
 */
export function Paragraph(props: ParagraphProps) {
  const { children, variant = 'foreground', color, fs = 'base', spacing = 'base' } = props

  const fontSizeClass = getFontSizeClass(fs)

  const variants = {
    foreground: 'text-ink',
    muted: 'text-ink-muted',
    error: 'text-danger',
    custom: `${color}`,
  }

  const spacings = {
    xs: '',
    sm: '[&:not(:first-child)]:mt-2',
    base: '[&:not(:first-child)]:mt-4',
    xl: '[&:not(:first-child)]:mt-6',
  }

  return (
    <p
      className={`${variants[variant]} ${fontSizeClass} text-balance leading-7 ${spacings[spacing]}`}
    >
      {children}
    </p>
  )
}
