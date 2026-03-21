import { Section } from '~/components/atoms/section'
import { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { Heading } from '~/components/atoms/heading'
import { Icon } from '~/components/atoms/icon'
import type { icons } from 'lucide-react'

interface AdminMainBaseProps {
  title: string
  icon?: keyof typeof icons
  action?: ReactNode
  children: ReactNode
}

export function AdminMain(props: AdminMainBaseProps) {
  const { title, icon, action, children } = props

  return (
    <Section className="py-8 grid gap-4">
      <Head title={title} />
      <div className="flex justify-between items-center w-full">
        <Heading level={2}>
          {icon && <Icon name={icon} size={32} />}
          {title}
        </Heading>
        {action}
      </div>
      {children}
    </Section>
  )
}
