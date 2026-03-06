import { Form } from '@adonisjs/inertia/react'
import { useTranslation } from 'react-i18next'
import { Head } from '@inertiajs/react'
import { Section } from '~/components/atoms/section'
import { Card } from '~/components/atoms/card'
import { Field } from '~/components/molecules/field'
import { Button } from '~/components/atoms/button'
import { useFormValidation } from '~/hooks/use_form_validation'
import { presets } from '~/helpers/validation_rules'
import { AuthIntro } from '~/components/molecules/auth_intro'

export default function ForgotPasswordPage() {
  const { t } = useTranslation('auth')

  const validation = useFormValidation({
    email: presets.email,
  })

  return (
    <>
      <Head title={t('forgot_password.title')} />
      <Section>
        <div className="container">
          <AuthIntro
            title={t('forgot_password.title')}
            text={t('forgot_password.subtitle')}
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            }
          />
          <Card>
            <Form
              route="auth.forgot_password.execute"
              className="grid gap-6"
              onBefore={(visit) => {
                const isValid = validation.validateAll(visit.data as Record<string, any>)
                if (!isValid) return false
              }}
            >
              {({ errors, processing }) => (
                <>
                  <Field
                    label={t('login.email')}
                    name="email"
                    type="email"
                    placeholder={t('login.email_placeholder')}
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
                  <div className="flex gap-3">
                    <Button
                      loading={processing}
                      type={"submit"}
                      fitContent
                    >
                      {t('forgot_password.submit')}
                    </Button>
                    <Button
                      route="auth.session.render"
                      fitContent
                      variant="outline"
                    >
                      {t('forgot_password.back_to_login')}
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
