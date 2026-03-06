import { ReactNode } from 'react'
import { Paragraph } from '~/components/atoms/paragraph'

interface BannerProps {
  type: 'success' | 'danger' | 'info' | 'warning'
  title: string | ReactNode
  message: string | ReactNode
  children?: ReactNode
}
export function Banner (props: BannerProps) {
  const { type, title, message, children } = props

  const config = {
    success: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-700',
    },
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-700',
    },
    warning: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-700',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-700',
    },
  }

  return <div className={`p-4 rounded border-1 ${config[type].bg} ${config[type].border}`}>
    <Paragraph
      variant="custom"
      color={`font-bold ${config[type].text}`}
    >
      {title}
    </Paragraph>
    <Paragraph
      variant="custom"
      color={`${config[type].text}`}
    >
      {message}
    </Paragraph>
    {children}
  </div>
}
