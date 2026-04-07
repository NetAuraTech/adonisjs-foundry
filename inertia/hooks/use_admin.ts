import { useCallback, useMemo } from 'react'
import { type LinkParams, type LinkProps } from '@adonisjs/inertia/react'
import { useTranslation } from 'react-i18next'
import { type icons } from 'lucide-react'

interface MenuEntryBase {
  label: string
  icon?: keyof typeof icons
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
 * Returns the application menu and related utilities, optionally extended or overridden.
 *
 * Categories from `overrides` are deep-merged with the default menu:
 * - Existing categories have their entries appended by the override entries
 * - New categories are appended
 *
 * @param overrides - Partial menu to merge into the default menu
 * @returns An object containing:
 * - `menu` — the merged menu object
 * - `getEntryIcon` — a function to retrieve the icon of a menu entry by its route
 *
 * @example
 * // Default menu only
 * const { menu } = useMenu()
 *
 * @example
 * // Override an existing category and add a new one
 * const { menu } = useMenu({
 *   main: [{ label: 'home', icon: '', route: 'home.render' }],
 *   settings: [{ label: 'profile', icon: '', route: 'settings.profile.render' }],
 * })
 *
 * @example
 * // Retrieve the icon of a menu entry by its route
 * const { getEntryIcon } = useMenu()
 * const icon = getEntryIcon('admin.dashboard.render')
 */
export function useMenu(overrides: Menu = {}) {
  const { t } = useTranslation('admin')

  const defaultMenu: Menu = {
    main: [
      {
        label: t('dashboard.value'),
        icon: 'House',
        route: 'admin.dashboard.render',
        permission: 'admin.access',
      },
    ],
    content: [
      {
        label: t('pages.value'),
        icon: 'PanelsTopLeft',
        route: 'admin.pages.render',
        permission: 'pages.view',
      },
      {
        label: t('templates.value'),
        icon: 'LayoutTemplate',
        route: 'admin.templates.render',
        permission: 'templates.manage',
      },
      {
        label: t('files.value'),
        icon: 'Folder',
        route: 'admin.files.render',
        permission: 'files.view',
      },
    ],
    access_control: [
      {
        label: t('users.value'),
        icon: 'Users',
        route: 'admin.users.render',
        permission: 'users.view',
      },
    ],
  }

  const menu = useMemo(() => {
    const merged: Menu = { ...defaultMenu }

    Object.entries(overrides).forEach(([category, entries]) => {
      merged[category] = [...(merged[category] ?? []), ...entries]
    })

    return merged
  }, [overrides])

  /**
   * Retrieves the icon of a menu entry by its route.
   *
   * Searches across all categories of the merged menu and returns the icon
   * of the first matching entry, or `undefined` if no entry is found.
   *
   * @param route - The route identifier of the menu entry
   * @returns The icon string if found, otherwise `undefined`
   *
   * @example
   * const icon = getEntryIcon('admin.dashboard.render')
   */
  const getEntryIcon = useCallback(
    (route: NonNullable<LinkProps['route']>): keyof typeof icons | undefined => {
      return Object.values(menu)
        .flat()
        .find((entry) => entry.route === route)?.icon
    },
    [menu]
  )

  return { menu, getEntryIcon }
}

export type { MenuEntry, AnyMenuEntry, Menu }
