import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { useTranslation } from 'react-i18next'
import logo from '~/assets/logo.png'
import { NavLink } from '~/components/atoms/nav_link'
import { Link } from '@adonisjs/inertia/react'
import { Avatar } from '~/components/atoms/avatar'
import { Authenticated } from '~/guards/authenticated'

/**
 * Global application header.
 *
 * Renders a sticky top navigation bar with a logo, a primary nav menu, and
 * an auth-aware user slot. On mobile the nav collapses into a slide-in panel
 * toggled by an animated hamburger button. On desktop (`md` breakpoint and
 * above) the panel is always visible as a horizontal flex row.
 *
 * **Menu state** is managed locally with `useState`. The menu automatically
 * closes after any successful Inertia navigation so users are never left with
 * an open panel on the destination page. Active element focus is also blurred
 * on close to prevent lingering focus rings.
 *
 * **Auth slot** — when the user is authenticated, a `<Link>` to the settings
 * page wrapping `<Avatar showUsername />` is rendered. When unauthenticated,
 * a login `<NavLink>` is shown instead (via the `<Authenticated>` guard).
 *
 * ARIA attributes (`aria-expanded`, `aria-controls`) are kept in sync with
 * the menu state for screen-reader accessibility. The `data-state` attribute
 * is exposed for CSS-driven transitions if needed.
 */
export function Header() {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const unregisterListener = router.on('success', () => {
      setIsMenuOpen(false)
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    })

    return () => unregisterListener()
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  const menuState = isMenuOpen ? 'opened' : 'closed'
  const isExpanded = isMenuOpen ? 'true' : 'false'

  return (
    <header className="header bg-surface" data-state={menuState} aria-expanded={isExpanded}>
      <Link href="/" className="header__logo fs-600" onClick={closeMenu}>
        <img src={logo} alt="Logo" />
      </Link>

      <nav
        id="primary-navigation"
        className="header__nav bg-surface"
        data-state={menuState}
        aria-expanded={isExpanded}
      >
        <NavLink route={'home'} label={t('header.home')} fs="md:xl" variant="nav" />
        <Authenticated
          fallback={
            <NavLink
              route={'auth.session.render'}
              label={t('auth:login.value')}
              fs="md:xl"
              variant="nav"
            />
          }
        >
          <Link route="settings.index">
            <Avatar showUsername />
          </Link>
        </Authenticated>
      </nav>
      <button
        className="header__burger text-ink md:display-hidden"
        aria-controls="primary-navigation"
        aria-expanded={isExpanded}
        data-state={menuState}
        aria-label={t('header.menu_label')}
        onClick={toggleMenu}
      >
        <svg
          stroke="currentColor"
          fill="none"
          className="hamburger"
          viewBox="-10 -10 120 120"
          width="50"
        >
          <path
            className="line"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m 20 40 h 60 a 1 1 0 0 1 0 20 h -60 a 1 1 0 0 1 0 -40 h 30 v 70"
          ></path>
        </svg>
      </button>
    </header>
  )
}
