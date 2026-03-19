import { useMemo } from 'react'
import { MetaData } from '~/types/paginated'
import { useTranslation } from 'react-i18next'
import type { LinkParams, LinkProps } from '@adonisjs/inertia/react'
import { NavLink } from '~/components/atoms/nav_link'

interface PaginationBaseProps {
  metadata: MetaData
  showPages?: number
  filters?: {
    [key: string]: string
  }
}

type PaginationProps<R extends NonNullable<LinkProps['route']>> = PaginationBaseProps & {
  route: R
} & (LinkParams<R>['routeParams'] extends undefined | never
    ? { routeParams?: never }
    : { routeParams: LinkParams<R>['routeParams'] })

type PageItem = number | '...'

export function Pagination<R extends NonNullable<LinkProps['route']>>(props: PaginationProps<R>) {
  const { metadata, showPages = 5, filters, ...routeProps } = props
  const { lastPage, perPage, currentPage, total } = metadata
  const { t } = useTranslation('pagination')

  const start = (currentPage - 1) * perPage + 1
  const end = Math.min(currentPage * perPage, total)

  const pages = useMemo<PageItem[]>(() => {
    if (lastPage <= showPages + 2) {
      return Array.from({ length: lastPage }, (_, i) => i + 1)
    }

    let s = Math.max(2, currentPage - 1)
    let e = Math.min(lastPage - 1, currentPage + 1)

    if (currentPage <= 3) e = Math.min(4, lastPage - 1)
    if (currentPage >= lastPage - 2) s = Math.max(lastPage - 3, 2)

    const middle: PageItem[] = []
    if (s > 2) middle.push('...')
    for (let i = s; i <= e; i++) middle.push(i)
    if (e < lastPage - 1) middle.push('...')

    return [1, ...middle, lastPage]
  }, [currentPage, lastPage, showPages])

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-1">
      <p className="text-sm text-ink-muted tabular-nums">{t('showing', { start, end, total })}</p>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        {currentPage > 1 ? (
          <NavLink
            variant="pagination"
            label="«"
            {...(routeProps as any)}
            qs={{ ...filters, page: currentPage - 1 }}
          />
        ) : (
          <NavLink
            variant="pagination"
            label="«"
            {...(routeProps as any)}
            qs={{ ...filters, page: currentPage - 1 }}
            disabled
          />
        )}
        {pages.map((page, index) =>
          page === '...' ? (
            <span
              key={`ellipsis-${index}`}
              className="grid size-8 place-items-center text-sm text-ink-muted select-none"
            >
              …
            </span>
          ) : (
            <NavLink
              key={`page-${page}`}
              variant="pagination"
              label={`${page}`}
              {...(routeProps as any)}
              qs={{ ...filters, page }}
            />
          )
        )}
        {currentPage < lastPage ? (
          <NavLink
            variant="pagination"
            label="»"
            {...(routeProps as any)}
            qs={{ ...filters, page: currentPage + 1 }}
          />
        ) : (
          <NavLink
            variant="pagination"
            label="»"
            {...(routeProps as any)}
            qs={{ ...filters, page: currentPage + 1 }}
            disabled
          />
        )}
      </nav>
    </div>
  )
}
