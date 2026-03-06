import {usePage} from "@inertiajs/react";
import {ReactNode} from "react";
import type {FontSize} from "~/types/font";
import {getFontSizeClass} from "~/utils/font";
import { Link } from '@adonisjs/inertia/react'
import type { LinkProps, LinkParams } from '@adonisjs/inertia/react'
import { urlFor } from '~/client'

type NavLinkBaseProps = {
  label: string
  children?: ReactNode
  onClick?: () => void
  fs?: FontSize
  variant?: 'link' | 'nav' | 'setting_nav'
  fitContent?: boolean
}

type NavLinkProps<R extends NonNullable<LinkProps["route"]>> = NavLinkBaseProps & {
  route: R
} & (LinkParams<R>["routeParams"] extends (undefined | never)
  ? { routeParams?: never }
  : { routeParams: LinkParams<R>["routeParams"] })

export function NavLink<R extends NonNullable<LinkProps["route"]>>(props: NavLinkProps<R>) {
  const { label, children, onClick, fs = 'base', variant = 'link' } = props

  const { url } = usePage();
  const fontSizeClass = getFontSizeClass(fs);

  const resolvedHref = (urlFor as (route: string, params?: unknown) => string)(props.route, props.routeParams)
  const isActive = url === resolvedHref || url.startsWith(`${resolvedHref}/`)

  const variants = {
    link: 'text-accent-600 hover:text-accent-800',
    nav: 'current:text-accent-600 hover:text-accent-600',
    setting_nav: 'px-4 py-2.5 border-b-2 -mb-px border-transparent current:border-accent-800 hover:border-accent-800 text-muted current:text-accent-800 hover:text-accent-800'
  }

  const linkProps = { route: props.route, routeParams: props.routeParams } as unknown as LinkProps<R>

  return (
    <Link
      {...linkProps}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      className={`${fontSizeClass} ${variants[variant]}`}
    >
      {children}
      {label}
    </Link>
  )
}
