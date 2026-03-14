import { useMemo } from 'react'
import { type LinkParams, type LinkProps } from '@adonisjs/inertia/react'
import { useTranslation } from 'react-i18next'

interface MenuEntryBase {
  label: string
  icon: string
  permission: string | string[]
}

type MenuEntry<R extends NonNullable<LinkProps['route']>> = MenuEntryBase & {
  route: R
} & (LinkParams<R>['routeParams'] extends undefined | never
    ? { routeParams?: never }
    : { routeParams: LinkParams<R>['routeParams'] })

type AnyMenuEntry = {
  [R in NonNullable<LinkProps['route']>]: MenuEntry<R>
}[NonNullable<LinkProps['route']>]

interface Menu {
  [key: string]: AnyMenuEntry[]
}

/**
 * Returns the application menu, optionally extended or overridden.
 *
 * Categories from `overrides` are deep-merged with the default menu:
 * - Existing categories are replaced by the override entries
 * - New categories are appended
 *
 * @param overrides - Partial menu to merge into the default menu
 * @returns The merged menu object
 *
 * @example
 * // Default menu only
 * const menu = useMenu()
 *
 * @example
 * // Override an existing category and add a new one
 * const menu = useMenu({
 *   main: [{ label: 'home', icon: '', route: 'home.render' }],
 *   settings: [{ label: 'profile', icon: '', route: 'settings.profile.render' }],
 * })
 */
export function useMenu(overrides: Menu = {}) {
  const { t } = useTranslation('admin')
  const defaultMenu: Menu = {
    main: [
      {
        label: t('dashboard.value'),
        icon: '',
        route: 'admin.dashboard.render',
        permission: 'admin.access',
      },
    ],
  }

  return useMemo(() => {
    const merged: Menu = { ...defaultMenu }

    Object.entries(overrides).forEach(([category, entries]) => {
      merged[category] = [...(merged[category] ?? []), ...entries]
    })

    return merged
  }, [overrides])
}

export type { MenuEntry, AnyMenuEntry, Menu }
