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

/**
 * Admin dashboard: one block per domain section present in the payload.
 *
 * Every section is optional server-side (a domain contributes its figures
 * only when it registered a collector), so each block renders only when its
 * section is provided — a domain absent from the composition simply
 * disappears instead of leaving empty figures behind.
 */
export default function DashboardPage(props: Props) {
  const { stats, translations } = props
  const pageProps = usePage<SharedProps>().props
  const { t, format } = useTranslation(translations)

  const { auth, page, template, file } = stats

  const formatDate = (value: string | null) =>
    value ? format(new Date(value), 'medium', pageProps.locale as Lang) : '—'

  return (
    <AdminMain title={t('title')} icon="House">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {auth && (
          <CanAccess permission="users.view">
            <StatCard
              icon="Users"
              label={t('cards.users')}
              value={auth.users}
              route="admin.users.render"
            >
              {auth.usersByRole.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  {auth.usersByRole.map((role) => (
                    <span key={role.name ?? 'no-role'} className="text-ink-muted">
                      {`${role.count} ${role.name ?? t('cards.no_role')}`}
                    </span>
                  ))}
                </div>
              )}
            </StatCard>
          </CanAccess>
        )}

        {page && (
          <CanAccess permission="pages.view">
            <StatCard
              icon="PanelsTopLeft"
              label={t('cards.pages')}
              value={page.pages}
              route="admin.pages.render"
            >
              <Paragraph variant="muted" spacing="sm">
                {`${t('cards.translations')}: ${page.pageTranslations.total}`}
              </Paragraph>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="text-success">{`${page.pageTranslations.published} ${t('status.published')}`}</span>
                <span className="text-secondary">{`${page.pageTranslations.draft} ${t('status.draft')}`}</span>
                <span className="text-warning">{`${page.pageTranslations.archived} ${t('status.archived')}`}</span>
              </div>
              <Paragraph variant="muted" spacing="sm">
                {`${t('cards.published_locales')}: ${page.publishedLocales}`}
              </Paragraph>
              {template && (
                <CanAccess permission="templates.view">
                  <Paragraph variant="muted" spacing="sm">
                    {`${t('cards.templates')}: ${template.templates}`}
                  </Paragraph>
                </CanAccess>
              )}
            </StatCard>
          </CanAccess>
        )}

        {!page && template && (
          <CanAccess permission="templates.view">
            <StatCard
              icon="LayoutTemplate"
              label={t('cards.templates')}
              value={template.templates}
              route="admin.templates.render"
            />
          </CanAccess>
        )}

        {file && (
          <CanAccess permission="files.view">
            <StatCard
              icon="Folder"
              label={t('cards.files')}
              value={file.files}
              route="admin.files.render"
            >
              <Paragraph variant="muted" spacing="sm">
                {`${t('cards.folders')}: ${file.fileFolders}`}
              </Paragraph>
              {file.filesByFolder.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  {file.filesByFolder.map((folder) => (
                    <span key={folder.id} className="text-ink-muted">
                      {`${folder.count} ${folder.name}`}
                    </span>
                  ))}
                </div>
              )}
            </StatCard>
          </CanAccess>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {page && (
          <CanAccess permission="pages.view">
            <RecentCard
              title={t('recent.published_pages')}
              viewAllRoute="admin.pages.render"
              viewAllLabel={t('view_all')}
            >
              {page.recentPublishedPages.length === 0 ? (
                <Paragraph variant="muted" spacing="xs" className="p-6">
                  {t('recent.empty')}
                </Paragraph>
              ) : (
                <ul className="divide-y divide-edge">
                  {page.recentPublishedPages.map((entry) => (
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
        )}

        {file && (
          <CanAccess permission="files.view">
            <RecentCard
              title={t('recent.uploads')}
              viewAllRoute="admin.files.render"
              viewAllLabel={t('view_all')}
            >
              {file.recentFiles.length === 0 ? (
                <Paragraph variant="muted" spacing="xs" className="p-6">
                  {t('recent.empty')}
                </Paragraph>
              ) : (
                <ul className="divide-y divide-edge">
                  {file.recentFiles.map((upload) => (
                    <li
                      key={upload.id}
                      className="flex items-center justify-between gap-2 px-6 py-3"
                    >
                      <span className="truncate">
                        {upload.originalName}{' '}
                        <span className="text-ink-subtle">({upload.mimeType})</span>
                      </span>
                      <span className="shrink-0 text-sm text-ink-muted">
                        {formatDate(upload.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </RecentCard>
          </CanAccess>
        )}
      </div>
    </AdminMain>
  )
}

DashboardPage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>
