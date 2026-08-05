import { ReactElement, ReactNode } from 'react'
import Layout from '~/layouts/admin'
import { SharedProps } from '@adonisjs/inertia/types'
import { Data } from '@generated/data'
import { AdminMain } from '~/components/organisms/admin/admin_main'
import { Card } from '~/components/atoms/card'
import { Paragraph } from '~/components/atoms/paragraph'
import { Icon } from '~/components/atoms/icon'
import { CanAccess } from '~/guards/can_access'
import { Link, type LinkProps } from '@adonisjs/inertia/react'
import { Lang, useTranslation } from '~/hooks/use_translation'
import { usePage } from '@inertiajs/react'
import type { CmsDashboardTranslations } from '#types/translations'

interface Props {
  stats: Data.Dashboard
  translations: CmsDashboardTranslations
}

type Route = NonNullable<LinkProps['route']>

/**
 * Clickable headline figure deep-linking to its management page.
 */
function StatCard(props: {
  icon: string
  label: string
  value: number
  route: Route
  children?: ReactNode
}) {
  const { icon, label, value, route, children } = props

  return (
    <Link route={route} className="block group">
      <Card padding="p-6" className="h-full transition-colors group-hover:border-primary">
        <div className="flex items-center gap-4">
          <Icon name={icon} size={28} className="text-ink-muted shrink-0" />
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold leading-none">{value}</p>
            <Paragraph variant="muted" spacing="xs">
              {label}
            </Paragraph>
          </div>
        </div>
        {children}
      </Card>
    </Link>
  )
}

/**
 * Recent-activity list card with a "view all" link in its footer.
 */
function RecentCard(props: {
  title: string
  viewAllRoute: Route
  viewAllLabel: string
  children: ReactNode
}) {
  const { title, viewAllRoute, viewAllLabel, children } = props

  return (
    <Card
      title={title}
      padding="p-0"
      className="h-full"
      footer={
        <Link route={viewAllRoute} className="text-sm text-primary hover:underline">
          {viewAllLabel}
        </Link>
      }
    >
      {children}
    </Card>
  )
}

export default function DashboardPage(props: Props) {
  const { stats, translations } = props
  const pageProps = usePage<SharedProps>().props
  const { t, format } = useTranslation(translations)

  const formatDate = (value: string | null) =>
    value ? format(new Date(value), 'medium', pageProps.locale as Lang) : '—'

  return (
    <AdminMain title={t('title')} icon="House">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <CanAccess permission="users.view">
          <StatCard
            icon="Users"
            label={t('cards.users')}
            value={stats.counts.users}
            route="admin.users.render"
          >
            {stats.usersByRole.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {stats.usersByRole.map((role) => (
                  <span key={role.name ?? 'no-role'} className="text-ink-muted">
                    {`${role.count} ${role.name ?? t('cards.no_role')}`}
                  </span>
                ))}
              </div>
            )}
          </StatCard>
        </CanAccess>

        <CanAccess permission="pages.view">
          <StatCard
            icon="PanelsTopLeft"
            label={t('cards.pages')}
            value={stats.counts.pages}
            route="admin.pages.render"
          >
            <Paragraph variant="muted" spacing="sm">
              {`${t('cards.translations')}: ${stats.counts.pageTranslations.total}`}
            </Paragraph>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="text-success">{`${stats.counts.pageTranslations.published} ${t('status.published')}`}</span>
              <span className="text-secondary">{`${stats.counts.pageTranslations.draft} ${t('status.draft')}`}</span>
              <span className="text-warning">{`${stats.counts.pageTranslations.archived} ${t('status.archived')}`}</span>
            </div>
            <Paragraph variant="muted" spacing="sm">
              {`${t('cards.published_locales')}: ${stats.counts.publishedLocales}`}
            </Paragraph>
            <CanAccess permission="templates.view">
              <Paragraph variant="muted" spacing="sm">
                {`${t('cards.templates')}: ${stats.counts.templates}`}
              </Paragraph>
            </CanAccess>
          </StatCard>
        </CanAccess>

        <CanAccess permission="files.view">
          <StatCard
            icon="Folder"
            label={t('cards.files')}
            value={stats.counts.files}
            route="admin.files.render"
          >
            <Paragraph variant="muted" spacing="sm">
              {`${t('cards.folders')}: ${stats.counts.fileFolders}`}
            </Paragraph>
            {stats.filesByFolder.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {stats.filesByFolder.map((folder) => (
                  <span key={folder.id} className="text-ink-muted">
                    {`${folder.count} ${folder.name}`}
                  </span>
                ))}
              </div>
            )}
          </StatCard>
        </CanAccess>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CanAccess permission="pages.view">
          <RecentCard
            title={t('recent.published_pages')}
            viewAllRoute="admin.pages.render"
            viewAllLabel={t('view_all')}
          >
            {stats.recentPublishedPages.length === 0 ? (
              <Paragraph variant="muted" spacing="xs" className="p-6">
                {t('recent.empty')}
              </Paragraph>
            ) : (
              <ul className="divide-y divide-edge">
                {stats.recentPublishedPages.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      route="admin.pages_show.render"
                      routeParams={{ id: entry.pageId }}
                      className="flex items-center justify-between gap-2 px-6 py-3 hover:bg-sunken"
                    >
                      <span className="truncate">
                        {entry.title} <span className="text-ink-subtle">({entry.locale})</span>
                      </span>
                      <span className="shrink-0 text-sm text-ink-muted">
                        {formatDate(entry.publishedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </RecentCard>
        </CanAccess>

        <CanAccess permission="files.view">
          <RecentCard
            title={t('recent.uploads')}
            viewAllRoute="admin.files.render"
            viewAllLabel={t('view_all')}
          >
            {stats.recentFiles.length === 0 ? (
              <Paragraph variant="muted" spacing="xs" className="p-6">
                {t('recent.empty')}
              </Paragraph>
            ) : (
              <ul className="divide-y divide-edge">
                {stats.recentFiles.map((file) => (
                  <li key={file.id} className="flex items-center justify-between gap-2 px-6 py-3">
                    <span className="truncate">
                      {file.originalName} <span className="text-ink-subtle">({file.mimeType})</span>
                    </span>
                    <span className="shrink-0 text-sm text-ink-muted">
                      {formatDate(file.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </RecentCard>
        </CanAccess>
      </div>
    </AdminMain>
  )
}

DashboardPage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>
