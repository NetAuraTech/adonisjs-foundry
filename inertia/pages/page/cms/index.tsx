import { ReactElement } from 'react'
import { Button } from '~/components/atoms/button'
import { Pagination } from '~/components/molecules/pagination'
import { Form } from '@adonisjs/inertia/react'
import { AdminMain } from '~/components/organisms/admin/admin_main'
import { Paginated } from '~/types/paginated'
import { Data } from '@generated/data'
import { useTranslation } from 'react-i18next'
import type { SharedProps } from '@adonisjs/inertia/types'
import Layout from '~/layouts/admin'
import { useMenu } from '~/hooks/use_admin'
import { CanAccess } from '~/guards/can_access'
import { Card } from '~/components/atoms/card'
import Table from '~/components/atoms/table/table'
import { Icon } from '~/components/atoms/icon'
import { Field } from '~/components/molecules/field'
import { resources } from '~/lib/i18n'
import { SelectOption } from '~/components/atoms/select_option'
import type { PageStatus } from '#types/page'

interface Props {
  pages: Paginated<Data.Page>
  filters: {
    status?: string
    locale?: string
    search?: string
  }
}

const PAGE_STATUSES: PageStatus[] = ['draft', 'published', 'archived']

const statusesClass = {
  published: 'text-success border-success bg-success-soft',
  draft: 'text-accent border-accent bg-accent-light/20',
  archived: 'text-warning border-warning bg-warning-soft',
} as const

export default function PagesIndexPage(props: Props) {
  const { pages, filters } = props
  const { t } = useTranslation()

  const { getEntryIcon } = useMenu()

  return (
    <>
      <AdminMain
        title={t('admin:pages.list.title')}
        icon={getEntryIcon('admin.pages.render')}
        action={
          <CanAccess permission="pages.create">
            <Button route="admin.pages_create.render" variant="accent" fitContent>
              {t('admin:pages.list.action')}
            </Button>
          </CanAccess>
        }
      >
        <Card
          header={
            <Form
              route="admin.pages.render"
              className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
            >
              <Field
                type="text"
                name="search"
                label={t('admin:search.value')}
                placeholder={t('admin:search.placeholder')}
                defaultValue={filters.search}
                sanitize
              />
              <Field
                type="select"
                label={t(`admin:pages.locale.value`)}
                name="locale"
                placeholder={t(`admin:pages.locale.all`)}
                defaultValue={filters.locale}
                sanitize
              >
                {Object.keys(resources).map((l) => (
                  <SelectOption key={l} value={l} label={l.toUpperCase()} />
                ))}
              </Field>
              <Field
                type="select"
                label={t(`admin:pages.status.value`)}
                name="status"
                placeholder={t(`admin:pages.status.all`)}
                defaultValue={filters.status}
                sanitize
              >
                {PAGE_STATUSES.map((status) => (
                  <SelectOption
                    key={`status-${status}`}
                    value={status}
                    label={t(`admin:pages.status.${status}`)}
                  />
                ))}
              </Field>
              <Button type="submit" fitContent>
                {t('admin:search.filter')}
              </Button>
            </Form>
          }
          footer={
            <Pagination route="admin.pages.render" filters={filters} metadata={pages.metadata} />
          }
        >
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t('admin:pages.title.value')}</Table.HeaderCell>
                <Table.HeaderCell>{t(`admin:pages.slug.value`)}</Table.HeaderCell>
                <Table.HeaderCell>{t(`admin:pages.status.value`)}</Table.HeaderCell>
                <Table.HeaderCell>{t(`admin:pages.locale.value`)}</Table.HeaderCell>
                <Table.HeaderCell>{t('admin:actions.value')}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pages.data.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center! p-12!">
                    {t('admin:pages.list.empty')}
                  </Table.Cell>
                </Table.Row>
              ) : (
                pages.data.map((page) => {
                  const primary =
                    page.translations.find((t) => t.locale === page.defaultLocale) ??
                    page.translations[0]

                  return (
                    <Table.Row key={`page-${page.id}`}>
                      <Table.Cell data-label={t('admin:pages.value', { count: 1 })}>
                        {primary?.title ?? '—'}
                      </Table.Cell>
                      <Table.Cell data-label={t(`admin:pages.slug.value`)}>
                        <code>/{primary?.slug ?? '—'}</code>
                      </Table.Cell>
                      <Table.Cell data-label={t(`admin:pages.status.value`)}>
                        {primary && (
                          <span
                            className={`px-4 py-1 border rounded ${statusesClass[primary.status]}`}
                          >
                            {t(`admin:pages.status.${primary.status}`)}
                          </span>
                        )}
                      </Table.Cell>
                      <Table.Cell data-label={t(`admin:pages.locale.value`)}>
                        <div className="flex gap-1 flex-wrap">
                          {page.translations.map((t) => (
                            <span
                              key={t.locale}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-sunken text-ink-muted border border-edge uppercase"
                            >
                              {t.locale}
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${t.status === 'published' ? 'bg-success' : 'bg-edge-strong'}`}
                              />
                            </span>
                          ))}
                        </div>
                      </Table.Cell>
                      <Table.Cell data-label={t('admin:actions.value')}>
                        <div className="flex items-center w-full py-4 gap-2">
                          <CanAccess permission="pages.view">
                            <Button
                              variant="icon_info"
                              route="admin.pages_show.render"
                              routeParams={{ id: page.id }}
                              title={t('admin:pages.show.title', { title: primary?.title ?? '—' })}
                              fitContent
                            >
                              <Icon name="Eye" size={18} />
                            </Button>
                          </CanAccess>
                          <CanAccess permission="pages.update">
                            <Button
                              variant="icon_warning"
                              route="admin.pages_update.render"
                              routeParams={{ id: page.id }}
                              title={t('admin:pages.edit.title', { title: primary?.title ?? '—' })}
                              fitContent
                            >
                              <Icon name="Pen" size={18} />
                            </Button>
                          </CanAccess>
                          <CanAccess permission="pages.delete">
                            <Form
                              onBefore={() => {
                                return window.confirm(t('admin:pages.delete.confirm'))
                              }}
                              route="admin.pages.destroy"
                              routeParams={{ id: page.id }}
                            >
                              <Button
                                variant="icon_danger"
                                title={t('admin:pages.delete.title', {
                                  title: primary?.title ?? `Page #${page.id}`,
                                })}
                                fitContent
                              >
                                <Icon name="Trash" size={18} />
                              </Button>
                            </Form>
                          </CanAccess>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )
                })
              )}
            </Table.Body>
          </Table>
        </Card>
      </AdminMain>
    </>
  )
}

PagesIndexPage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>
