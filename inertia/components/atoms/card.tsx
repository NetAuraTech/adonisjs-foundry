import { ReactNode } from 'react'
import { Heading } from '~/components/atoms/heading'
import { Paragraph } from '~/components/atoms/paragraph'

interface CardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  border?: 'none' | 'muted' | 'danger'
}

export function Card(props: CardProps) {
  const { children, title, subtitle, header, footer, border = 'muted' } = props

  const borders = {
    none: '',
    muted: 'border border-edge',
    danger: 'border border-danger',
  }

  return (
    <div className={`card ${borders[border]}`}>
      {(header || title) && (
        <div className="p-8 border-b border-solid border-edge">
          {header ? (
            header
          ) : (
            <div>
              {title && <Heading level={3}>{title}</Heading>}
              {subtitle && (
                <Paragraph variant="muted" spacing="sm">
                  {subtitle}
                </Paragraph>
              )}
            </div>
          )}
        </div>
      )}
      <div className="p-8">{children}</div>
      {footer && <div className="p-8 border-t border-solid border-edge bg-sunken">{footer}</div>}
    </div>
  )
}
