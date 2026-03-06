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
import { useState } from 'react'
import { InertiaProps } from '~/types'

type PageProps = InertiaProps<{ token: string }>

export default function ResetPasswordPage(props: PageProps) {
  const { t } = useTranslation('auth')

  const { token } = props

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const validation = useFormValidation({
    password: presets.password,
    password_confirmation: presets.passwordConfirmation(password),
  })

  return (
    <>
      <Head title={t('reset_password.title')} />
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
              route="auth.reset_password.execute"
              className="grid gap-6"
              onBefore={(visit) => {
                const isValid = validation.validateAll(visit.data as Record<string, any>)
                if (!isValid) return false
              }}
            >
              {({ errors, processing }) => (
                <>
                  <input type="hidden" id="token" name="token" value={token} />
                  <Field
                    label={t('register.password')}
                    name="password"
                    type="password"
                    errorMessage={errors.password || validation.getValidationMessage('password')}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      validation.handleChange('password', event.target.value)
                      validation.handleChange('password_confirmation', confirmPassword)
                    }}
                    onBlur={(event) => {
                      setPassword(event.target.value)
                      validation.handleBlur('password', event.target.value)
                      validation.handleBlur('password_confirmation', confirmPassword)
                    }}
                    required
                    sanitize={false}
                    helpText={t('register.password_help')}
                    helpClassName={validation.getHelpClassName('password')}
                  />
                  <Field
                    label={t('register.confirmation')}
                    name="password_confirmation"
                    type="password"
                    errorMessage={
                      errors.password_confirmation ||
                      validation.getValidationMessage('password_confirmation')
                    }
                    onChange={(event) => {
                      setConfirmPassword(event.target.value)
                      validation.handleChange('password_confirmation', event.target.value)
                    }}
                    onBlur={(event) => {
                      setConfirmPassword(event.target.value)
                      validation.handleBlur('password_confirmation', event.target.value)
                    }}
                    required
                    sanitize={false}
                    helpText={t('register.confirmation_help')}
                    helpClassName={validation.getHelpClassName('password_confirmation')}
                  />
                  <div className="flex gap-3">
                    <Button
                      loading={processing}
                      type={"submit"}
                      fitContent
                    >
                      {t('reset_password.submit')}
                    </Button>
                    <Button
                      route="auth.session.render"
                      fitContent
                      variant="outline"
                    >
                      {t('reset_password.back_to_login')}
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
