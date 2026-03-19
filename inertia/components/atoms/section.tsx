import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  id?: string
  className?: string
}

export function Section(props: SectionProps) {
  const { children, className = 'py-8', ...sectionProps } = props

  return (
    <section {...sectionProps} className={className}>
      {children}
    </section>
  )
}
