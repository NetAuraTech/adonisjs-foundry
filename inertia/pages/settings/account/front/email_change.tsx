import { Form } from '@adonisjs/inertia/react'
import { useTranslation } from 'react-i18next'
import { Head } from '@inertiajs/react'
import { Section } from '~/components/atoms/section'
import { Card } from '~/components/atoms/card'
import { Button } from '~/components/atoms/button'
import { useFormValidation } from '~/hooks/use_form_validation'
import { rules } from '~/helpers/validation_rules'
import { AuthIntro } from '~/components/molecules/auth_intro'
import { Field } from '~/components/molecules/field'
import { Banner } from '~/components/molecules/banner'

interface PageProps {
  token: string
}

export default function EmailChangePage(props: PageProps) {
  const { t } = useTranslation('settings')

  const { token } = props

  const validation = useFormValidation({
    token: [rules.required('token')],
  })

  return (
    <>
      <Head title={t('account.email.change.title')} />
      <Section>
        <div className="container">
          <AuthIntro
            title={t('account.email.change.title')}
            text={t('account.email.change.sub_title')}
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            }
          />
          <Card
          >
            <Form
              route="settings.email_change.execute"
              className="grid gap-6"
              onBefore={(visit) => {
                const isValid = validation.validateAll(visit.data as Record<string, any>)
                if (!isValid) return false
              }}
            >
              {({ errors, processing }) => (
                <>
                  <Banner
                    title={t('account.email.change.info.title')}
                    message={t('account.email.change.info.message')}
                    type="info"
                  />
                  <Field
                    label={t('account.email.change.token')}
                    name="token"
                    type="text"
                    defaultValue={token}
                    errorMessage={errors.token || validation.getValidationMessage('token')}
                    onChange={(event) => {
                      validation.handleChange('token', event.target.value)
                    }}
                    onBlur={(event) => {
                      validation.handleBlur('token', event.target.value)
                    }}
                    required
                    disabled
                    sanitize
                  />
                  <input id="token" name="token" type="hidden" value={token} />
                  <div className="flex gap-3">
                    <Button
                      loading={processing}
                      type={"submit"}
                      fitContent
                    >
                      {t('account.email.change.submit')}
                    </Button>
                    <Button
                      route="settings.account.render"
                      fitContent
                      variant="outline"
                    >
                      {t('account.email.change.cancel')}
                    </Button>
                  </div>
                </>
              )}
            </Form>
          </Card>
        </div>
      </Section>
    </>
  )
}
