import { ReactNode } from 'react'
import { Paragraph } from '~/components/atoms/paragraph'

interface BannerProps {
  type: 'success' | 'danger' | 'info' | 'warning'
  title: string | ReactNode
  message: string | ReactNode
  children?: ReactNode
}

export function Banner(props: BannerProps) {
  const { type, title, message, children } = props

  const config = {
    success: { bg: 'bg-success-soft', text: 'text-success', border: 'border-success' },
    danger: { bg: 'bg-danger-soft', text: 'text-danger', border: 'border-danger' },
    warning: { bg: 'bg-warning-soft', text: 'text-warning', border: 'border-warning' },
    info: { bg: 'bg-info-soft', text: 'text-info', border: 'border-info' },
  }

  return (
    <div className={`p-4 rounded border ${config[type].bg} ${config[type].border}`}>
      <Paragraph variant="custom" color={`font-bold ${config[type].text}`}>
        {title}
      </Paragraph>
      <Paragraph variant="custom" color={config[type].text}>
        {message}
      </Paragraph>
      {children}
    </div>
  )
}
