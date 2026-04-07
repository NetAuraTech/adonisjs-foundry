import { Button, variants } from '~/components/atoms/button'
import { AdminMain } from '~/components/organisms/admin/admin_main'
import { Card } from '~/components/atoms/card'
import { Icon } from '~/components/atoms/icon'
import { CanAccess } from '~/guards/can_access'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'react'
import type { SharedProps } from '@adonisjs/inertia/types'
import Layout from '~/layouts/admin'
import { useMenu } from '~/hooks/use_admin'
import { Paragraph } from '~/components/atoms/paragraph'
import Table from '~/components/atoms/table/table'
import { Form } from '@adonisjs/inertia/react'
import { Data } from '@generated/data'

interface PageProps {
  revisions: Data.PageRevision[]
  translation_id: number
  page_id: number
}

export default function PageRevisionsPage(props: PageProps) {
  const { revisions, translation_id, page_id } = props

  const { t, i18n } = useTranslation()
  const { getEntryIcon } = useMenu()

  return (
    <>
      <AdminMain
        title={t('admin:pages.show.revision.value')}
        icon={getEntryIcon('admin.pages.render')}
      >
        <Card
          header={
            <CanAccess permission="pages.update">
              <Button
                variant="icon"
                route="admin.pages_update.render"
                routeParams={{ id: page_id }}
                title={t('admin:pages.show.revision.back')}
                fitContent
              >
                <Icon name="ArrowLeft" />
              </Button>
            </CanAccess>
          }
          footer={<Paragraph variant="muted">{t('admin:pages.show.revision.help')}</Paragraph>}
        >
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t('admin:pages.show.revision.index')}</Table.HeaderCell>
                <Table.HeaderCell>{t('admin:pages.show.revision.created.at')}</Table.HeaderCell>
                <Table.HeaderCell>{t('admin:pages.show.revision.created.by')}</Table.HeaderCell>
                <Table.HeaderCell>{t('admin:actions.value')}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {revisions.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center! p-12!">
                    <Paragraph variant="muted">
                      {t('admin:pages.show.revision.empty.value')}
                    </Paragraph>
                    <Paragraph variant="subtle">
                      {t('admin:pages.show.revision.empty.help')}
                    </Paragraph>
                  </Table.Cell>
                </Table.Row>
              ) : (
                revisions.map((revision, index) => (
                  <Table.Row key={`revision-${revision.id}`}>
                    <Table.Cell data-label={t('admin:pages.show.revision.index')}>
                      {revisions.length - index}
                    </Table.Cell>
                    <Table.Cell data-label={t('admin:pages.show.revision.created.at')}>
                      {i18n.format(new Date(revision.createdAt!), 'medium', i18n.language, {
                        withTime: true,
                      })}
                    </Table.Cell>
                    <Table.Cell data-label={t('admin:pages.show.revision.created.by')}>
                      {revision.created_by && revision.created_by.username}
                    </Table.Cell>
                    <Table.Cell data-label={t('admin:actions.value')}>
                      <div className="flex items-center w-full py-4 gap-2">
                        {index !== 0 ? (
                          <CanAccess permission="pages.update">
                            <Form
                              onBefore={() => {
                                return window.confirm(
                                  t('admin:pages.show.revision.restore.confirm')
                                )
                              }}
                              route="admin.page_revisions.restore"
                              routeParams={{
                                translationId: translation_id,
                                revisionId: revision.id,
                                id: page_id,
                              }}
                            >
                              <Button
                                variant="icon_info"
                                title={t('admin:pages.show.revision.restore.value')}
                                fitContent
                              >
                                <Icon name="ArchiveRestore" size={18} />
                              </Button>
                            </Form>
                          </CanAccess>
                        ) : (
                          <span
                            className={`button ${variants['icon_info']} font-medium cursor-not-allowed pointer-events-none`}
                          >
                            {t('admin:pages.show.revision.latest')}
                          </span>
                        )}
                        <CanAccess permission="pages.update">
                          <Form
                            route="admin.page_revisions.toggle_keep"
                            routeParams={{
                              translationId: translation_id,
                              revisionId: revision.id,
                              id: page_id,
                            }}
                          >
                            <Button
                              variant={revision.keep ? 'icon_danger' : 'icon_warning'}
                              title={
                                revision.keep
                                  ? t('admin:pages.show.revision.unpin')
                                  : t('admin:pages.show.revision.pin')
                              }
                              fitContent
                            >
                              <Icon name={revision.keep ? 'PinOff' : 'Pin'} size={18} />
                            </Button>
                          </Form>
                        </CanAccess>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </Card>
      </AdminMain>
    </>
  )
}

PageRevisionsPage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>
