import { ReactNode } from 'react'
import { Link } from '@adonisjs/inertia/react'
import type { LinkProps, LinkParams } from '@adonisjs/inertia/react'
import { urlFor } from '~/client'

interface ButtonBaseProps {
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  variant?:
    | 'primary'
    | 'accent'
    | 'danger'
    | 'success'
    | 'outline'
    | 'social'
    | 'icon'
    | 'icon_danger'
    | 'icon_warning'
    | 'icon_info'
  disabled?: boolean
  children: ReactNode
  title?: string
  onClick?: () => void
  fitContent?: boolean
  external?: boolean
}

type ButtonRouteProps<R extends NonNullable<LinkProps['route']>> = ButtonBaseProps & {
  route: R
} & (LinkParams<R>['routeParams'] extends undefined | never
    ? { routeParams?: never }
    : { routeParams: LinkParams<R>['routeParams'] })

type ButtonNoRouteProps = ButtonBaseProps & {
  route?: never
  routeParams?: never
}

type ButtonProps<R extends NonNullable<LinkProps['route']>> =
  | ButtonRouteProps<R>
  | ButtonNoRouteProps

export function Button<R extends NonNullable<LinkProps['route']>>(props: ButtonProps<R>) {
  const {
    loading,
    type = 'submit',
    variant = 'primary',
    disabled = false,
    children,
    title,
    onClick,
    fitContent = false,
    route,
    routeParams,
    external = false,
    ...buttonProps
  } = props

  const state = loading || disabled ? 'disabled' : 'active'
  const size = fitContent ? 'fit' : 'full'

  const variants = {
    primary: 'bg-primary text-ink-inverted hover:bg-primary-deep',
    accent: 'bg-accent text-ink-inverted hover:bg-accent-deep',
    danger: 'bg-danger text-ink-inverted hover:opacity-90',
    success: 'bg-success text-ink-inverted hover:opacity-90',
    outline:
      'border-2 border-solid border-primary text-primary hover:bg-primary hover:text-ink-inverted',
    social: 'bg-surface border border-solid border-edge hover:border-edge-strong shadow text-ink',
    icon: 'hover:text-primary p-2',
    icon_danger: 'bg-danger-soft text-danger hover:bg-danger hover:text-ink-inverted p-2',
    icon_warning: 'bg-warning-soft text-warning hover:bg-warning hover:text-ink-inverted p-2',
    icon_info: 'bg-info-soft text-info hover:bg-info hover:text-ink-inverted p-2',
  }

  const states = {
    active: '',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
  }

  const sizes = {
    fit: 'w-fit',
    full: 'w-full',
  }

  const content = (
    <>
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animation:spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </>
  )

  if (route) {
    const linkProps = { route, routeParams } as unknown as LinkProps<R>

    if (external) {
      return (
        <a
          href={urlFor(route as any, routeParams as any)}
          className={`button ${variants[variant]} ${states[state]} ${sizes[size]}`}
          title={title}
        >
          {content}
        </a>
      )
    }

    return (
      <Link
        {...linkProps}
        className={`button ${variants[variant]} ${states[state]} ${sizes[size]}`}
        onClick={onClick}
        title={title}
        {...buttonProps}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      disabled={loading || disabled}
      type={type}
      onClick={onClick}
      className={`button ${variants[variant]} ${states[state]} ${sizes[size]}`}
      title={title}
      {...buttonProps}
    >
      {content}
    </button>
  )
}
