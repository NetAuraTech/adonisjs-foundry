import { Form } from '@adonisjs/inertia/react'
import { useTranslation } from 'react-i18next'
import { Head } from '@inertiajs/react'
import { Section } from '~/components/atoms/section'
import { Card } from '~/components/atoms/card'
import { Paragraph } from '~/components/atoms/paragraph'
import { NavLink } from '~/components/atoms/nav_link'
import { Field } from '~/components/molecules/field'
import { Button } from '~/components/atoms/button'
import { useFormValidation } from '~/hooks/use_form_validation'
import { presets } from '~/helpers/validation_rules'
import { AuthIntro } from '~/components/molecules/auth_intro'
import type { OAuthProvider } from '#types/auth'
import { AuthProviders } from '~/components/molecules/auth_providers'

interface PageProps {
  providers: OAuthProvider[]
}

export default function LoginPage(props: PageProps) {
  const { t } = useTranslation('auth')

  const { providers } = props

  const validation = useFormValidation({
    email: presets.email,
    password: presets.password,
  })

  return (
    <>
      <Head title={t('login.title')} />
      <Section>
        <div className="container">
          <AuthIntro
            title={t('login.title')}
            text={t('login.subtitle')}
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
                  {t('login.no_account')}{' '}
                  <NavLink
                    route={"auth.register.render"}
                    label={t('login.create_account')}
                    fs="sm"
                  />
                </Paragraph>
              </div>
            }
          >
            <Form
              route="auth.session.execute"
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
                    label={t('login.password')}
                    name="password"
                    type="password"
                    errorMessage={errors.password || validation.getValidationMessage('password')}
                    onChange={(event) => {
                      validation.handleChange('password', event.target.value)
                    }}
                    onBlur={(event) => {
                      validation.handleBlur('password', event.target.value)
                    }}
                    required
                    sanitize={false}
                  />
                  <div className="grid gap-2 md:flex md:items-center md:justify-between">
                    <Field
                      label={t('login.remember_me')}
                      name="remember_me"
                      type="checkbox"
                    />
                    <NavLink
                      route="auth.forgot_password.render"
                      label={t('login.forgot_password')}
                    />
                  </div>
                  <Button
                    loading={processing}
                    type={"submit"}
                    fitContent
                  >
                    {t('login.submit')}
                  </Button>
                </>
              )}
            </Form>
            <AuthProviders providers={providers} />
          </Card>
        </div>
      </Section>
    </>
  )
}
