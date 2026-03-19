import { usePage } from '@inertiajs/react'
import { ReactNode } from 'react'
import type { FontSize } from '~/types/font'
import { getFontSizeClass } from '~/utils/font'
import { Link } from '@adonisjs/inertia/react'
import type { LinkProps, LinkParams } from '@adonisjs/inertia/react'
import { urlFor } from '~/client'

type NavLinkBaseProps = {
  label: string
  children?: ReactNode
  onClick?: () => void
  fs?: FontSize
  variant?: 'link' | 'nav' | 'setting_nav' | 'pagination'
  fitContent?: boolean
  disabled?: boolean
}

type NavLinkProps<R extends NonNullable<LinkProps['route']>> = NavLinkBaseProps & {
  route: R
  anchor?: string
  qs?: Record<string, any> | undefined
} & (LinkParams<R>['routeParams'] extends undefined | never
    ? { routeParams?: never }
    : { routeParams: LinkParams<R>['routeParams'] })

export function NavLink<R extends NonNullable<LinkProps['route']>>(props: NavLinkProps<R>) {
  const { label, children, onClick, fs = 'base', variant = 'link', disabled } = props

  const { url } = usePage()
  const fontSizeClass = getFontSizeClass(fs)

  const resolvedHref = (urlFor as (route: string, params?: unknown) => string)(
    props.route,
    props.routeParams
  )

  const [currentPath, currentSearch] = url.split('?')
  const currentParams = new URLSearchParams(currentSearch ?? '')

  const pathMatches = currentPath === resolvedHref || currentPath.startsWith(`${resolvedHref}/`)

  const qsMatches = (() => {
    if (!props.qs) return true

    return Object.entries(props.qs).every(([key, value]) => {
      const currentValue = currentParams.get(key)
      if (key === 'page' && value === 1 && currentValue === null) return true
      return currentValue === String(value)
    })
  })()

  const isActive = pathMatches && qsMatches

  const variants = {
    link: 'text-accent-600 hover:text-accent-800',
    nav: 'text-primary-950 current:text-accent-600 hover:text-accent-600',
    setting_nav:
      'px-4 py-2.5 border-b-2 -mb-px border-transparent current:border-accent-800 hover:border-accent-800 text-muted current:text-accent-800 hover:text-accent-800 cursor-pointer',
    pagination:
      'button font-normal hover:bg-primary-800 hover:text-neutral-100 current:bg-primary-800 current:text-neutral-100 px-2 py-1',
  }

  const states = {
    active: '',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
  }

  const state = disabled ? 'disabled' : 'active'

  const linkProps =
    props.anchor || props.qs
      ? {
          href: `${urlFor(props.route as any, props.routeParams as any, { qs: props.qs })}${props.anchor ? `#${props.anchor}` : ''}`,
        }
      : ({
          route: props.route,
          routeParams: props.routeParams,
        } as unknown as LinkProps<R>)

  return (
    <Link
      {...linkProps}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      className={`${fontSizeClass} ${variants[variant]} ${states[state]}`}
    >
      {children}
      {label}
    </Link>
  )
}
