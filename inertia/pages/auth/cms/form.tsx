import { ReactElement } from 'react'
import Layout from '~/layouts/admin'
import type { SharedProps } from '@adonisjs/inertia/types'
import { Data } from '@generated/data'
import { useTranslation } from 'react-i18next'
import { AdminMain } from '~/components/organisms/admin/admin_main'
import { useMenu } from '~/hooks/use_admin'
import { CanAccess } from '~/guards/can_access'
import { Card } from '~/components/atoms/card'
import { Button } from '~/components/atoms/button'
import { Icon } from '~/components/atoms/icon'
import { useFormValidation } from '~/hooks/use_form_validation'
import { presets, rules } from '~/helpers/validation_rules'
import { Field } from '~/components/molecules/field'
import { Form } from '@adonisjs/inertia/react'
import { SelectOption } from '~/components/atoms/select_option'

type PageProps = {
  user?: Data.User
  roles: Data.Role[]
}

export default function UsersFormPage(props: PageProps) {
  const { user, roles } = props
  const { t } = useTranslation()

  const isEditing = user !== undefined

  const { getEntryIcon } = useMenu()

  const validation = useFormValidation({
    email: presets.email,
    username: presets.username,
    role_id: [
      ...presets.selectWithOptions([...roles.map((r) => r.id)], 'role_id'),
      rules.required('role_id'),
    ],
  })

  return (
    <AdminMain
      title={
        isEditing
          ? t('admin:users.edit.title', { username: user!.username })
          : t('admin:users.create.title')
      }
      icon={getEntryIcon('admin.users.render')}
    >
      <Card
        header={
          <div className="flex items-center justify-between gap-3">
            <CanAccess permission="users.view">
              <Button
                variant="icon"
                route="admin.users.render"
                title={t('admin:users.list.title')}
                fitContent
              >
                <Icon name="ArrowLeft" />
              </Button>
            </CanAccess>
          </div>
        }
      >
        <Form
          route={isEditing ? 'admin.users_update.execute' : 'admin.users_create.execute'}
          routeParams={isEditing ? { id: user!.id } : {}}
          className="grid gap-6"
          onBefore={(visit) => {
            const isValid = validation.validateAll(visit.data as Record<string, any>)
            if (!isValid) return false
          }}
        >
          {({ errors, processing }) => (
            <>
              <Field
                label={t('admin:users.form.email.value')}
                name="email"
                type="email"
                defaultValue={user?.email}
                placeholder={t('admin:users.form.email.placeholder')}
                errorMessage={errors.email || validation.getValidationMessage('email')}
                onChange={(event) => {
                  validation.handleChange('email', event.target.value)
                }}
                onBlur={(event) => {
                  validation.handleBlur('email', event.target.value)
                }}
                required
                sanitize
              />
              <Field
                label={t('admin:users.form.username.value')}
                name="username"
                type="text"
                defaultValue={user?.username}
                placeholder={t('admin:users.form.username.placeholder')}
                errorMessage={errors.username || validation.getValidationMessage('username')}
                onChange={(event) => {
                  validation.handleChange('username', event.target.value)
                }}
                onBlur={(event) => {
                  validation.handleBlur('username', event.target.value)
                }}
                required
                sanitize
              />
              <Field
                label={t('admin:users.form.role.value')}
                name="role_id"
                type="select"
                defaultValue={user?.role?.id}
                placeholder={t('admin:users.form.role.placeholder')}
                errorMessage={errors.role_id || validation.getValidationMessage('role_id')}
                onChange={(event) => {
                  validation.handleChange('role_id', event.target.value)
                }}
                onBlur={(event) => {
                  validation.handleBlur('role_id', event.target.value)
                }}
                required
                sanitize
              >
                {roles &&
                  roles.map((role) => <SelectOption label={t(role.name)} value={role.id} />)}
              </Field>
              <Button loading={processing} type={'submit'} fitContent>
                {t('admin:users.form.submit')}
              </Button>
            </>
          )}
        </Form>
      </Card>
    </AdminMain>
  )
}

UsersFormPage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>
