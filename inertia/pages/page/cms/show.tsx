import { ReactElement } from 'react'
import { Button, variants } from '~/components/atoms/button'
import type { SharedProps } from '@adonisjs/inertia/types'
import Layout from '~/layouts/admin'
import { AdminMain } from '~/components/organisms/admin/admin_main'
import { Form, Link } from '@adonisjs/inertia/react'
import { Data } from '@generated/data'
import { useTranslation } from 'react-i18next'
import { Card } from '~/components/atoms/card'
import { CanAccess } from '~/guards/can_access'
import { Icon } from '~/components/atoms/icon'
import { Heading } from '~/components/atoms/heading'

interface Props {
  page: Data.Page
}

const statusesClass = {
  published: {
    badge: 'text-success border-success bg-success-soft',
    dot: 'bg-success',
  },
  draft: {
    badge: 'text-accent border-accent bg-accent-light/20',
    dot: 'bg-accent-light',
  },
  archived: {
    badge: 'text-warning border-warning bg-warning-soft',
    dot: 'bg-warning',
  },
} as const

export default function PagesShowPage(props: Props) {
  const { page } = props
  const { t, i18n } = useTranslation('admin')

  const primaryTranslation =
    page.translations.find((t) => t.locale === page.defaultLocale) ?? page.translations[0]

  return (
    <>
      <AdminMain
        title={t('pages.show.title', { title: primaryTranslation?.title ?? `Page #${page.id}` })}
      >
        <Card
          header={
            <div className="flex items-center justify-between gap-3">
              <CanAccess permission="pages.view">
                <Button
                  variant="icon"
                  route="admin.pages.render"
                  title={t('pages.list.title')}
                  fitContent
                >
                  <Icon name="ArrowLeft" />
                </Button>
              </CanAccess>
              <div className="flex gap-3">
                <CanAccess permission="pages.update">
                  <Button
                    variant="icon_warning"
                    route="admin.pages_update.render"
                    routeParams={{ id: page.id }}
                    title={t('admin:pages.edit.title', {
                      title: primaryTranslation?.title ?? `Page #${page.id}`,
                    })}
                    fitContent
                  >
                    <Icon name="Pen" size={18} />
                  </Button>
                </CanAccess>
                <CanAccess permission="pages.delete">
                  <Form
                    onBefore={() => {
                      return window.confirm(t('pages.delete.confirm'))
                    }}
                    route="admin.pages.destroy"
                    routeParams={{ id: page.id }}
                  >
                    <Button
                      variant="icon_danger"
                      title={t('admin:pages.delete.title', {
                        title: primaryTranslation?.title ?? `Page #${page.id}`,
                      })}
                      fitContent
                    >
                      <Icon name="Trash" size={18} />
                    </Button>
                  </Form>
                </CanAccess>
              </div>
            </div>
          }
        >
          <div className="grid gap-3">
            <div className="grid gap-3">
              <Heading level={3}>
                {t('admin:pages.show.translation', { count: page.translations.length })}
              </Heading>
              {page.translations.map((translation) => {
                const isDefault = translation.locale === page.defaultLocale

                return (
                  <div
                    key={translation.id}
                    className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-xl border border-edge bg-canvas px-4 py-3"
                  >
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2 w-16 shrink-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusesClass[translation.status].dot} shrink-0`}
                        />
                        <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                          {translation.locale}
                        </span>
                        {isDefault && (
                          <span className="text-xs text-ink-subtle">
                            ({t('pages.show.default')})
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{translation.title}</p>
                        <code className="text-xs text-ink-muted">/{translation.slug}</code>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-3">
                      <span
                        className={`px-4 py-1 border rounded ${statusesClass[translation.status].badge}`}
                      >
                        {t(`admin:pages.status.${translation.status}`)}
                      </span>
                      <div className="flex items-center gap-3 text-ink-subtle shrink-0">
                        {translation.metaTitle && (
                          <span
                            className="flex items-center gap-1"
                            title={t('pages.show.meta.title')}
                          >
                            <Icon name="Tag" size={18} />
                            SEO
                          </span>
                        )}
                        <span title={t('pages.show.last_update')}>
                          {i18n.format(new Date(translation.updatedAt!), 'medium', i18n.language)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {translation.status === 'published' && (
                          <a
                            href={`/${translation.locale !== page.defaultLocale ? `${translation.locale}/` : ''}${translation.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`button ${variants['icon_info']}`}
                            title={t('admin:pages.show.title', {
                              title: translation?.title ?? '—',
                            })}
                          >
                            <Icon name="Eye" size={18} />
                          </a>
                        )}
                        <Button
                          variant="icon_warning"
                          route="admin.pages_update.render"
                          routeParams={{ id: page.id }}
                          title={t('admin:pages.edit.title', {
                            title: primaryTranslation?.title ?? `Page #${page.id}`,
                          })}
                          fitContent
                        >
                          <Icon name="Pen" size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="grid gap-3">
              <Heading level={3}>{t('admin:pages.show.meta.value')}</Heading>
              <div className="rounded-xl border border-edge bg-canvas divide-y divide-edge">
                <MetaRow label={t('pages.show.meta.id')} value={String(page.id)} />
                <MetaRow
                  label={t('pages.show.meta.locale')}
                  value={page.defaultLocale.toUpperCase()}
                />
                <MetaRow
                  label={t('pages.show.meta.translations')}
                  value={`${page.translations.length}`}
                />
                <MetaRow
                  label={t('pages.show.meta.created')}
                  value={i18n.format(new Date(page.createdAt!), 'medium', i18n.language)}
                />
                <MetaRow
                  label={t('pages.show.meta.updated')}
                  value={i18n.format(new Date(page.updatedAt!), 'medium', i18n.language)}
                />
              </div>
            </div>
            <div className="grid gap-3">
              <Heading level={3}>{t('admin:pages.show.revision.value')}</Heading>
              {page.translations.map((translation) => (
                <Link
                  key={translation.id}
                  route="admin.page_revisions.index"
                  routeParams={{ id: page.id, translationId: translation.id }}
                  className="flex items-center justify-between rounded-lg border border-edge bg-canvas px-4 py-2.5 hover:bg-sunken transition-colors group"
                >
                  <span className="text-ink">
                    {translation.locale.toUpperCase()} — {translation.title}
                  </span>
                  <span className="text-ink-muted group-hover:text-primary-mid transition-colors">
                    {t('pages.show.revision.view')} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </AdminMain>
    </>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-ink-muted">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  )
}

PagesShowPage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>
