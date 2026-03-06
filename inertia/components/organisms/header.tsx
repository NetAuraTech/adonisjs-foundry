import {useEffect, useState} from "react";
import { router, usePage} from "@inertiajs/react";
import {useTranslation} from "react-i18next";
import logo from '~/assets/logo.png'
import type {SharedProps} from "@adonisjs/inertia/types";
import {NavLink} from "~/components/atoms/nav_link";
import { Link } from '@adonisjs/inertia/react'
import { Avatar } from '~/components/atoms/avatar'
export function Header() {
  const { t } = useTranslation('common')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const pageProps = usePage<SharedProps>().props

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
    <header className="header bg-neutral-100" data-state={menuState} aria-expanded={isExpanded}>
      <Link href="/" className="header__logo fs-600" onClick={closeMenu}>
        <img src={logo} alt="Logo" />
      </Link>

      <nav
        id="primary-navigation"
        className="header__nav bg-neutral-100"
        data-state={menuState}
        aria-expanded={isExpanded}
      >
        <NavLink route={'home'} label={t('header.home')} fs="md:xl" variant="nav" />

        {pageProps.currentUser ? (
          <Link
            route="home"
          >
            <Avatar showUsername />
          </Link>
        ) : (
          <NavLink route={'auth.session.render'} label={t('header.login')} fs="md:xl" variant="nav" />
        )}
      </nav>
      <button
        className="header__burger clr-primary-900 md:display-hidden"
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
