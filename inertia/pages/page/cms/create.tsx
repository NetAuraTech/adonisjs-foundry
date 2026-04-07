import { ReactElement } from 'react'
import { Button } from '~/components/atoms/button'
import { Field } from '~/components/molecules/field'
import { useTranslation } from 'react-i18next'
import { Card } from '~/components/atoms/card'
import { AdminMain } from '~/components/organisms/admin/admin_main'
import { useMenu } from '~/hooks/use_admin'
import { Form } from '@adonisjs/inertia/react'
import { SelectOption } from '~/components/atoms/select_option'
import { resources } from '~/lib/i18n'
import { Heading } from '~/components/atoms/heading'
import type { SharedProps } from '@adonisjs/inertia/types'
import Layout from '~/layouts/admin'
import { Paragraph } from '~/components/atoms/paragraph'
import { Separator } from '~/components/atoms/separator'
import { CanAccess } from '~/guards/can_access'
import { Icon } from '~/components/atoms/icon'
import { useFormValidation } from '~/hooks/use_form_validation'
import { presets, rules } from '~/helpers/validation_rules'

export default function PagesCreatePage() {
  const { t } = useTranslation()

  const { getEntryIcon } = useMenu()

  const validation = useFormValidation({
    locale: [
      ...presets.selectWithOptions(
        [...Object.keys(resources).map((locale) => locale)],
        t('admin:pages.form.locale.default')
      ),
      rules.required(t('admin:pages.form.locale.default')),
    ],
    title: presets.title(t('admin:pages.form.title.value')),
    slug: presets.slug(t('admin:pages.form.slug.value')),
    metaTitle: [rules.maxLength(150, t('admin:pages.form.meta.title.value'))],
    metaDescription: [rules.maxLength(500, t('admin:pages.form.meta.description.value'))],
  })

  return (
    <>
      <AdminMain title={t('admin:pages.create.title')} icon={getEntryIcon('admin.pages.render')}>
        <Card
          header={
            <div className="flex items-center justify-between gap-3">
              <CanAccess permission="pages.view">
                <Button
                  variant="icon"
                  route="admin.pages.render"
                  title={t('admin:pages.list.title')}
                  fitContent
                >
                  <Icon name="ArrowLeft" />
                </Button>
              </CanAccess>
            </div>
          }
        >
          <Form
            route="admin.pages_create.execute"
            className="grid gap-3"
            onBefore={(visit) => {
              const isValid = validation.validateAll(visit.data as Record<string, any>)
              if (!isValid) return false
            }}
          >
            {({ processing, errors }) => (
              <>
                <div className="grid gap-3">
                  <Heading level={3}>{t('admin:pages.create.details.value')}</Heading>
                  <Separator />
                  <Field
                    type="select"
                    name="locale"
                    label={t('admin:pages.form.locale.default')}
                    errorMessage={errors.locale || validation.getValidationMessage('locale')}
                    onChange={(event) => {
                      validation.handleChange('locale', event.target.value)
                    }}
                    onBlur={(event) => {
                      validation.handleBlur('locale', event.target.value)
                    }}
                    required
                    sanitize
                  >
                    {Object.keys(resources).map((l) => (
                      <SelectOption key={l} value={l} label={l.toUpperCase()} />
                    ))}
                  </Field>
                  <Field
                    type="text"
                    name="title"
                    label={t('admin:pages.form.title.value')}
                    placeholder={t('admin:pages.form.title.placeholder')}
                    errorMessage={errors.title || validation.getValidationMessage('title')}
                    onChange={(event) => {
                      validation.handleChange('title', event.target.value)
                    }}
                    onBlur={(event) => {
                      validation.handleBlur('title', event.target.value)
                    }}
                    required
                    sanitize
                  />
                  <Field
                    type="text"
                    name="slug"
                    label={t('admin:pages.form.slug.value')}
                    errorMessage={errors.slug || validation.getValidationMessage('slug')}
                    onChange={(event) => {
                      validation.handleChange('slug', event.target.value)
                    }}
                    onBlur={(event) => {
                      validation.handleBlur('slug', event.target.value)
                    }}
                    required
                    sanitize
                  />
                </div>
                <div className="grid gap-3 mt-5">
                  <Heading level={3}>{t('admin:pages.create.seo.value')}</Heading>
                  <Paragraph variant="muted" spacing="xs">
                    {t('admin:pages.create.seo.help', { title: t('admin:pages.form.title.value') })}
                  </Paragraph>
                  <Separator />
                  <Field
                    type="text"
                    name="metaTitle"
                    label={t('admin:pages.form.meta.title.value')}
                    placeholder={t('admin:pages.form.meta.title.placeholder')}
                    errorMessage={errors.metaTitle || validation.getValidationMessage('metaTitle')}
                    onChange={(event) => {
                      validation.handleChange('metaTitle', event.target.value)
                    }}
                    onBlur={(event) => {
                      validation.handleBlur('metaTitle', event.target.value)
                    }}
                    sanitize
                  />
                  <Field
                    type="textarea"
                    name="metaDescription"
                    label={t('admin:pages.form.meta.description.value')}
                    placeholder={t('admin:pages.form.meta.description.placeholder')}
                    errorMessage={
                      errors.metaDescription || validation.getValidationMessage('metaDescription')
                    }
                    onChange={(event) => {
                      validation.handleChange('metaDescription', event.target.value)
                    }}
                    onBlur={(event) => {
                      validation.handleBlur('metaDescription', event.target.value)
                    }}
                    sanitize
                  />
                </div>
                <Button loading={processing} type={'submit'} fitContent>
                  {t('admin:pages.form.submit')}
                </Button>
              </>
            )}
          </Form>
        </Card>
      </AdminMain>
    </>
  )
}

PagesCreatePage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>
