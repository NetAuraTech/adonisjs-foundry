import { Section } from '~/components/atoms/section'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Head } from '@inertiajs/react'
import { Heading } from '~/components/atoms/heading'
import { NavLink } from '~/components/atoms/nav_link'
import { Paragraph } from '~/components/atoms/paragraph'
import { CanAccess } from '~/guards/can_access'

const tabs = [
  { id: 'profile', label: 'settings:profile.value', route: 'settings.profile.render' },
  { id: 'account', label: 'settings:account.value', route: 'settings.account.render' },
  { id: 'preferences', label: 'settings:preferences.value', route: 'settings.preferences.render' },
] as const

interface PageProps {
  tab: (typeof tabs)[number]['id']
  children: ReactNode
}

export function SettingsLayout(props: PageProps) {
  const { children } = props

  const { t } = useTranslation()

  return (
    <>
      <Head title={t('settings:title')} />
      <Section>
        <div className="container">
          <div className="text-center mb-8">
            <Heading level={1}>{t('settings:title')}</Heading>
            <Paragraph variant="muted" spacing="sm">
              {t('settings:sub_title')}
            </Paragraph>
          </div>
          <div className="flex gap-1 justify-between border-b border-edge mb-8">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.id}
                  label={t(tab.label)}
                  route={tab.route}
                  variant="setting_nav"
                />
              ))}
            </div>
            <div className="flex gap-1">
              <CanAccess permission={'admin.access'}>
                <NavLink
                  label={t('admin:value')}
                  route="admin.dashboard.render"
                  variant="setting_nav"
                />
              </CanAccess>
              <NavLink
                label={t('auth:logout.value')}
                route="auth.session.destroy"
                variant="setting_nav"
              />
            </div>
          </div>
          <div className="grid gap-6">{children}</div>
        </div>
      </Section>
    </>
  )
}
