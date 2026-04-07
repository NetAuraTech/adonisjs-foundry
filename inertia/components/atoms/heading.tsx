import { ReactNode, ElementType } from 'react'

interface HeadingProps {
  /**
   * The heading level. Maps to `<h1>`–`<h4>` and controls the font size:
   * - `1` → `text-4xl`
   * - `2` → `text-3xl`
   * - `3` → `text-2xl`
   * - `4` → `text-xl`
   */
  level: 1 | 2 | 3 | 4
  /**
   * Tailwind text-color class applied to the heading.
   * Defaults to `'text-ink'`.
   */
  color?: string
  flex?: boolean
  children: ReactNode
}

/**
 * Semantic heading component that renders the appropriate `<h1>`–`<h4>` tag.
 *
 * The `level` prop controls both the HTML tag and the font size. Pass a
 * custom `color` class to override the default `text-ink` when the heading
 * is placed on a colored background (e.g. `text-ink-inverted`).
 *
 * @example
 * <Heading level={1}>Page title</Heading>
 * <Heading level={3} color="text-ink-muted">Section subtitle</Heading>
 */
export function Heading(props: HeadingProps) {
  const { level, color = 'text-ink', flex, children } = props

  const Tag = `h${level}` as ElementType

  const levels = {
    1: 'text-4xl',
    2: 'text-3xl',
    3: 'text-2xl',
    4: 'text-xl',
  }

  return (
    <Tag className={`${levels[level]} font-bold ${color}${flex ? ' flex gap-2 items-center' : ''}`}>
      {children}
    </Tag>
  )
}
