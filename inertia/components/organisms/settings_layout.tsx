import { Section } from '~/components/atoms/section'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Head } from '@inertiajs/react'
import { Heading } from '~/components/atoms/heading'
import { NavLink } from '~/components/atoms/nav_link'
import { Paragraph } from '~/components/atoms/paragraph'

const tabs = [
  { id: "profile", label: "profile.value", route: 'settings.profile.render' },
  { id: "account", label: "account.value", route: 'settings.account.render' },
] as const

interface PageProps {
  tab: (typeof tabs)[number]["id"]
  children: ReactNode
}

export function SettingsLayout(props: PageProps) {
  const { children } = props

  const { t } = useTranslation('settings')

  return <>
    <Head title={t('title')} />
    <Section>
      <div className="container">
        <div className="text-center mb-8">
          <Heading
            level={1}
          >
            {t('title')}
          </Heading>
          <Paragraph
            variant="muted"
            spacing="sm"
          >
            {t('sub_title')}
          </Paragraph>
        </div>
        <div className="flex gap-1 border-b border-neutral-200 mb-8">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              label={t(tab.label)}
              route={tab.route}
              variant="setting_nav"
            />
          ))}
        </div>
        <div className="grid gap-6">
          {children}
        </div>
      </div>
    </Section>
  </>
}
