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
  /** The active tab identifier — used externally to set the page context. */
  tab: (typeof tabs)[number]['id']
  /** Page-specific content rendered inside the settings grid. */
  children: ReactNode
}

/**
 * Shared layout for all settings pages.
 *
 * Renders a centred page title, a horizontal tab bar, and a content grid.
 * The tab bar is split into two groups:
 *
 * - **Left** — the three main settings tabs (Profile, Account, Preferences),
 *   always visible.
 * - **Right** — contextual actions: an Admin link guarded by the
 *   `admin.access` permission (hidden for regular users) and a Logout link.
 *
 * Active tab highlighting is handled by `<NavLink variant="setting_nav">`,
 * which applies a bottom-border indicator when `aria-current="page"` is set.
 *
 * The page title and subtitle are read from the `settings` i18n namespace
 * (`settings:title`, `settings:sub_title`).
 *
 * @example
 * // Used as the layout wrapper for each settings page component
 * export default function ProfilePage() {
 *   return (
 *     <SettingsLayout tab="profile">
 *       <Card title="Profile">...</Card>
 *     </SettingsLayout>
 *   )
 * }
 */
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
