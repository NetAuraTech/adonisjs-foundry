import { ReactElement } from 'react'
import Layout from '~/layouts/admin'
import type { SharedProps } from '@adonisjs/inertia/types'
import { Data } from '@generated/data'
import { Paginated } from '~/types/paginated'
import { Form } from '@adonisjs/inertia/react'
import { useTranslation } from 'react-i18next'
import { AdminMain } from '~/components/organisms/admin/admin_main'
import { useMenu } from '~/hooks/use_admin'
import { CanAccess } from '~/guards/can_access'
import { Card } from '~/components/atoms/card'
import { Button } from '~/components/atoms/button'
import { Field } from '~/components/molecules/field'
import { SelectOption } from '~/components/atoms/select_option'
import { Pagination } from '~/components/molecules/pagination'
import Table from '~/components/atoms/table/table'
import { StatusEnum, UserStatus } from '~/components/atoms/user_status'
import { Icon } from '~/components/atoms/icon'

type PageProps = {
  users: Paginated<Data.User>
  roles: Data.Role[]
  filters: {
    search?: string
    role?: string
  }
}

export default function UsersIndexPage(props: PageProps) {
  const { users, roles, filters } = props
  const { t, i18n } = useTranslation()

  const { getEntryIcon } = useMenu()

  return (
    <AdminMain
      title={t('admin:users.list.title')}
      icon={getEntryIcon('admin.users.render')}
      action={
        <CanAccess permission="users.create">
          <Button route="admin.users_create.render" variant="accent" fitContent>
            {t('admin:users.list.action')}
          </Button>
        </CanAccess>
      }
    >
      <Card
        header={
          <Form
            route="admin.users.render"
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
              name="role"
              label={t('roles:value', { count: 1 })}
              placeholder={t('roles:placeholder')}
              defaultValue={filters.role}
              sanitize
            >
              {roles && roles.map((role) => <SelectOption label={t(role.name)} value={role.id} />)}
            </Field>
            <Button type="submit" fitContent>
              {t('admin:search.filter')}
            </Button>
          </Form>
        }
        footer={
          <Pagination route="admin.users.render" filters={filters} metadata={users.metadata} />
        }
      >
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t('admin:users.value', { count: 1 })}</Table.HeaderCell>
              <Table.HeaderCell>{t('roles:value', { count: 1 })}</Table.HeaderCell>
              <Table.HeaderCell>{t('admin:users.status.value')}</Table.HeaderCell>
              <Table.HeaderCell>{t('admin:users.list.register_on')}</Table.HeaderCell>
              <Table.HeaderCell>{t('admin:actions.value')}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users.data.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5} className="text-center! p-12!">
                  {t('admin:users.list.empty')}
                </Table.Cell>
              </Table.Row>
            ) : (
              users.data.map((user) => (
                <Table.Row key={`user-${user.id}`}>
                  <Table.Cell
                    className="flex flex-row"
                    data-label={t('admin:users.value', { count: 1 })}
                  >
                    <span className="flex">{user.username}</span>
                    <span className="flex text-ink-muted">{user.email}</span>
                  </Table.Cell>
                  <Table.Cell data-label={t('roles:value', { count: 1 })}>
                    <span className="px-4 py-1 rounded border border-accent bg-accent-light/20 text-accent">
                      {t(user.role?.name)}
                    </span>
                  </Table.Cell>
                  <Table.Cell data-label={t('admin:users.status.value')}>
                    <UserStatus status={user.status as StatusEnum} user={user.id} />
                  </Table.Cell>
                  <Table.Cell data-label={t('admin:users.list.register_on')}>
                    {i18n.format(new Date(user.createdAt!), 'medium', i18n.language)}
                  </Table.Cell>
                  <Table.Cell data-label={t('admin:actions.value')}>
                    <div className="flex items-center w-full py-4 gap-2">
                      <CanAccess permission="users.view">
                        <Button
                          variant="icon_info"
                          route="admin.users_show.render"
                          routeParams={{ id: user.id }}
                          title={t('admin:users.show.title', { username: user.username })}
                          fitContent
                        >
                          <Icon name="Eye" size={18} />
                        </Button>
                      </CanAccess>
                      <CanAccess permission="users.update">
                        <Button
                          variant="icon_warning"
                          route="admin.users_update.render"
                          routeParams={{ id: user.id }}
                          title={t('admin:users.edit.title', { username: user.username })}
                          fitContent
                        >
                          <Icon name="Pen" size={18} />
                        </Button>
                      </CanAccess>
                      <CanAccess permission="users.delete">
                        <Button
                          variant="icon_danger"
                          route="admin.users.destroy"
                          routeParams={{ id: user.id }}
                          title={t('admin:users.delete.title', { username: user.username })}
                          fitContent
                        >
                          <Icon name="Trash" size={18} />
                        </Button>
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
  )
}

UsersIndexPage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>
