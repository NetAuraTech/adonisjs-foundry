import { useIsLarge } from '~/hooks/use_is_large'
import { usePage } from '@inertiajs/react'
import { SharedProps } from '@adonisjs/inertia/types'
import { useTranslation } from 'react-i18next'
import { Card } from '../../atoms/card'
import { Avatar } from '~/components/atoms/avatar'
import { ThemeToggle } from '~/components/molecules/theme_toggle'
import { Heading } from '../../atoms/heading'
import { NavLink } from '../../atoms/nav_link'
import { CanAccess } from '~/guards/can_access'
import { useMenu } from '~/hooks/use_admin'
import { Icon } from '~/components/atoms/icon'

interface AdminSidebarProps {
  /**
   * Whether the sidebar is currently open. Forwarded to `aria-expanded` on
   * the `<aside>` element so CSS transitions and screen readers react to the
   * state change.
   */
  sidebarOpen: boolean
  /** Setter passed down from the admin layout — reserved for future use. */
  setIsMenuOpen: (value: boolean) => void
}

/**
 * Collapsible navigation sidebar for the admin layout.
 *
 * Composed of two `<Card>` sections:
 *
 * 1. **User card** — shows the authenticated user's avatar, username, the
 *    current date (formatted in the active locale), and the `<ThemeToggle>`.
 * 2. **Navigation card** — renders the menu entries returned by `useMenu`,
 *    grouped by category. Each entry is wrapped in a `<CanAccess>` guard so
 *    links the user lacks permission for are silently hidden.
 *
 * Visibility is controlled by CSS via the `aria-expanded` attribute on the
 * `<aside>` and the `.sidebar` utility class defined in `app.css`. The
 * parent layout is responsible for toggling `sidebarOpen`.
 *
 * @example
 * const [sidebarOpen, setSidebarOpen] = useState(false)
 *
 * <AdminHeader handleClick={() => setSidebarOpen((v) => !v)} />
 * <AdminSidebar sidebarOpen={sidebarOpen} setIsMenuOpen={setSidebarOpen} />
 */
export function AdminSidebar(props: AdminSidebarProps) {
  const { sidebarOpen, setIsMenuOpen } = props
  const isLarge = useIsLarge()
  const pageProps = usePage<SharedProps>().props
  const { t, i18n } = useTranslation('admin')

  const { menu } = useMenu()

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
              <Heading level={4}>{t(`category.${category}`)}</Heading>
              <ul>
                {entries.map((entry) => (
                  <li key={`admin-category-${category}-${entry.label}`}>
                    <CanAccess permission={entry.permission}>
                      <NavLink
                        label={entry.label}
                        route={entry.route}
                        routeParams={entry.routeParams}
                      >
                        {entry.icon && <Icon name={entry.icon} />}
                      </NavLink>
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
