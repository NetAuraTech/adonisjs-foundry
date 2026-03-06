import { Form } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { useTranslation } from 'react-i18next'
import { Section } from '~/components/atoms/section'
import { AuthIntro } from '~/components/molecules/auth_intro'
import { Card } from '~/components/atoms/card'
import { Paragraph } from '~/components/atoms/paragraph'
import { NavLink } from '~/components/atoms/nav_link'
import { useFormValidation } from '~/hooks/use_form_validation'
import { presets } from '~/helpers/validation_rules'
import { Field } from '~/components/molecules/field'
import { Button } from '~/components/atoms/button'
import { useState } from 'react'

export default function RegisterPage() {
  const { t } = useTranslation('auth')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const validation = useFormValidation({
    email: presets.email,
    password: presets.password,
    password_confirmation: presets.passwordConfirmation(password),
  })

  return (
    <>
      <Head title={t('register.title')} />
      <Section>
        <div className="container">
          <AuthIntro
            title={t('register.title')}
            text={t('register.subtitle')}
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
            footer={
              <div className="text-center">
                <Paragraph
                  fs="sm"
                >
                  {t('register.has_account')}{' '}
                  <NavLink
                    route="auth.session.render"
                    label={t('register.login')}
                    fs="sm"
                  />
                </Paragraph>
              </div>
            }
          >
            <Form
              route="auth.register.execute"
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
                  <Button
                    loading={processing}
                    type={"submit"}
                    fitContent
                  >
                    {t('register.submit')}
                  </Button>
                </>
              )}
            </Form>
          </Card>
        </div>
      </Section>
    </>
  )
}
