import {ReactNode} from "react";
import { Link } from '@adonisjs/inertia/react'
import type { LinkProps, LinkParams } from '@adonisjs/inertia/react'
import { urlFor } from '~/client'

interface ButtonBaseProps {
  loading?: boolean
  type?: "button" | "submit" | "reset"
  variant?: "primary" | "accent" | "danger" | "success" | "outline" | "social"
  disabled?: boolean
  children: ReactNode
  title?: string
  onClick?: () => void
  fitContent?: boolean
  external?: boolean
}

type ButtonRouteProps<R extends NonNullable<LinkProps["route"]>> = ButtonBaseProps & {
  route: R
} & (LinkParams<R>["routeParams"] extends (undefined | never)
  ? { routeParams?: never }
  : { routeParams: LinkParams<R>["routeParams"] })

type ButtonNoRouteProps = ButtonBaseProps & {
  route?: never
  routeParams?: never
}

type ButtonProps<R extends NonNullable<LinkProps["route"]>> =
  | ButtonRouteProps<R>
  | ButtonNoRouteProps

export function Button<R extends NonNullable<LinkProps["route"]>>(props: ButtonProps<R>) {
  const {
    loading,
    type = "submit",
    variant = "primary",
    disabled = false,
    children,
    title,
    onClick,
    fitContent = false,
    route,
    routeParams,
    external = false
  } = props

  const state = (loading || disabled) ? 'disabled' : 'active'
  const size = fitContent ? 'fit' : 'full'

  const variants = {
    primary: 'bg-primary-800 text-neutral-100 hover:bg-primary-900',
    accent: 'bg-accent-600 text-neutral-100 hover:bg-accent-700',
    danger: 'bg-red-700 text-neutral-100 hover:bg-red-800',
    success: 'bg-green-600 text-neutral-100 hover:bg-green-700',
    outline: 'border-solid border-2 border-primary-900 text-primary-900  hover:bg-primary-900 hover:text-neutral-100',
    social: 'bg-neutral-50 border-solid border-1 border-neutral-100 hover:border-neutral-800 shadow',
  }

  const states = {
    active: '',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none'
  }

  const sizes = {
    fit: 'w-fit',
    full: 'w-full'
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
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </>
  )

  if (route) {
    const linkProps = { route, routeParams } as unknown as LinkProps<R>

    if(external) {
      return <a
        href={urlFor(route as any, routeParams as any)}
        className={`button ${variants[variant]} ${states[state]} ${sizes[size]}`}
        title={title}
      >
        {content}
      </a>
    }

    return (
      <Link
        {...linkProps}
        className={`button ${variants[variant]} ${states[state]} ${sizes[size]}`}
        onClick={onClick}
        title={title}
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
    >
      {content}
    </button>
  )
}
