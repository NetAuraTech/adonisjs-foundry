import {ReactNode} from "react";
import {Heading} from "~/components/atoms/heading";
import {Paragraph} from "~/components/atoms/paragraph";

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
    'none': '',
    'muted': 'border-1 border-muted/50',
    'danger': 'border-1 border-red-700',
  }

  return <div className={`card ${borders[border]}`}>
    {(header || title) && (
      <div className="p-8 border-solid border-b border-neutral-300">
        {header ? (
          header
        ) : (
          <div>
            {title && <Heading level={3}>{title}</Heading>}
            {subtitle && <Paragraph
              variant="muted"
              spacing="sm"
            >
              {subtitle
            }</Paragraph>}
          </div>
        )}
      </div>
    )}
    <div className="p-8">
      {children}
    </div>
    {footer && (
      <div className="p-8 border-solid border-t-1 border-neutral-300 bg-neutral-100">
        {footer}
      </div>
    )}
  </div>
}
