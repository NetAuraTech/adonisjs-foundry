import { ReactNode, ElementType } from 'react'

interface HeadingProps {
  level: 1 | 2 | 3 | 4
  color?: string
  children: ReactNode
}

export function Heading(props: HeadingProps) {
  const { level, color = 'text-foreground-title', children } = props

  const Tag = `h${level}` as ElementType

  const levels = {
    1: 'text-4xl',
    2: 'text-3xl',
    3: 'text-2xl',
    4: 'text-xl',
  }

  return (
    <Tag className={`${levels[level]} font-bold ${color}`}>
      {children}
    </Tag>
  )
}
