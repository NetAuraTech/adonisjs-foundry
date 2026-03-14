import { useIsLarge } from '~/hooks/use_is_large'
import { usePage } from '@inertiajs/react'
import { SharedProps } from '@adonisjs/inertia/types'
import { useTranslation } from 'react-i18next'
import { Card } from '../atoms/card'
import { Avatar } from '~/components/atoms/avatar'
import { ThemeToggle } from '~/components/molecules/theme_toggle'
import { Heading } from '../atoms/heading'
import { NavLink } from '../atoms/nav_link'
import { CanAccess } from '~/guards/can_access'
import { useMenu } from '~/hooks/use_admin'

interface AdminSidebarProps {
  sidebarOpen: boolean
  setIsMenuOpen: (value: boolean) => void
}

export function AdminSidebar(props: AdminSidebarProps) {
  const { sidebarOpen, setIsMenuOpen } = props
  const isLarge = useIsLarge()
  const pageProps = usePage<SharedProps>().props
  const { t, i18n } = useTranslation()

  const menu = useMenu()

  return (
    <aside className="sidebar" aria-expanded={sidebarOpen}>
      <Card>
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Avatar showUsername />
            <ThemeToggle />
          </div>
          <span>{i18n.format(new Date(), 'long', i18n.language)}</span>
        </div>
      </Card>
      <Card>
        <nav>
          {Object.entries(menu).map(([category, entries]) => (
            <div key={`admin-category-${category}`}>
              <Heading level={4}>{category}</Heading>
              <ul>
                {entries.map((entry) => (
                  <li key={`admin-category-${category}-${entry.label}`}>
                    <CanAccess permission={entry.permission}>
                      <NavLink
                        label={entry.label}
                        route={entry.route}
                        routeParams={entry.routeParams}
                      />
                    </CanAccess>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Card>
    </aside>
  )
}
