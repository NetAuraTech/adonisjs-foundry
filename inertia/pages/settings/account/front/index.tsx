import { SettingsLayout } from '~/components/organisms/settings_layout'
import { useTranslation } from 'react-i18next'
import { Card } from '~/components/atoms/card'
import { Form } from '@adonisjs/inertia/react'
import { useFormValidation } from '~/hooks/use_form_validation'
import { presets } from '~/helpers/validation_rules'
import { Field } from '~/components/molecules/field'
import { Button } from '~/components/atoms/button'
import { Data } from '@generated/data'
import type { OAuthProvider } from '#types/auth_type'
import { capitalize } from '~/lib/string'
import { urlFor } from '~/client'
import { useState } from 'react'
import { Banner } from '~/components/molecules/banner'

interface PageProps {
  user: Data.User
  providers: OAuthProvider[]
}

export default function AccountPage(props: PageProps) {
  const { user, providers } = props

  const { t } = useTranslation('settings')

  const validationEmailForm = useFormValidation({
    email: presets.email,
  })

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const validationPasswordForm = useFormValidation({
    current_password: presets.password,
    password: presets.password,
    password_confirmation: presets.passwordConfirmation(password),
  })

  const providerStyles: Record<OAuthProvider, { bg: string; text: string; border: string; initials: string }> = {
    google:   { bg: 'bg-red-50',      text: 'text-red-500', border: 'border-1 border-red-500',   initials: 'G'  },
    github:   { bg: 'bg-neutral-900', text: 'text-white', border: 'border-1 border-neutral-900',     initials: 'GH' },
    facebook: { bg: 'bg-blue-50',     text: 'text-blue-600', border: 'border-1 border-blue-600',  initials: 'F'  },
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const validationDeleteForm = useFormValidation({
    password: presets.password,
  })

  return (
    <>
      <SettingsLayout
        tab='account'
      >
        <Card
          title={t('account.email.title')}
          subtitle={t('account.email.sub_title')}
        >
          <Form
            route="settings.account.execute"
            className="grid gap-6"
            onBefore={(visit) => {
              const isValid = validationEmailForm.validateAll(visit.data as Record<string, any>)
              if (!isValid) return false
            }}
          >
            {({ errors, processing }) => (
              <>
                <input type="hidden" name="_action" value="update_email" />
                <Field
                  label={t('account.email.value')}
                  name="email"
                  type="email"
                  defaultValue={user.email || ''}
                  placeholder={t('account.email.placeholder')}
                  errorMessage={errors.email || validationEmailForm.getValidationMessage('email')}
                  onChange={(event) => {
                    validationEmailForm.handleChange('email', event.target.value)
                  }}
                  onBlur={(event) => {
                    validationEmailForm.handleBlur('email', event.target.value)
                  }}
                  required
                  sanitize
                />
                <Button
                  loading={processing}
                  type={"submit"}
                  fitContent
                >
                  {t('account.email.submit')}
                </Button>
              </>
            )}
          </Form>
        </Card>
        <Card
          title={t('account.oauth.title')}
          subtitle={t('account.oauth.sub_title')}
        >
          <div className="divide-y divide-neutral-200">
            {
              providers.map((provider) => {
              const isConnected = user.connectedProviders[provider]
              const style = providerStyles[provider]

              return (
                <div
                  key={provider}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center text-xs font-bold ${style.text} ${style.border}`}>
                      {style.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{capitalize(provider)}</p>
                      <p className={`text-xs ${isConnected ? 'text-green-600' : 'text-muted'}`}>
                        {isConnected ? t('account.oauth.connected') : t('account.oauth.not_connected')}
                      </p>
                    </div>
                  </div>

                  {isConnected ? (
                    <Form
                      route="auth.social.unlink"
                      routeParams={{ provider: provider }}
                      onBefore={() => confirm(t('account.oauth.unlink.confirm', { provider: capitalize(provider) }))}
                    >
                      <button
                        type="submit"
                        className="cursor-pointer text-sm px-3 py-1.5 border border-red-700 text-red-700 rounded-lg hover:bg-red-50 transition"
                        title={t('account.oauth.unlink')}
                      >
                        {t('account.oauth.unlink.value')}
                      </button>
                    </Form>
                  ) : (
                    <a
                      href={urlFor("auth.social.redirect", { provider: provider})}
                      className="text-sm px-3 py-1.5 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition"
                      title={t('account.oauth.link')}
                    >
                      {t('account.oauth.link')}
                    </a>
                  )}
                </div>
              )
            })
            }
          </div>
        </Card>
        <Card
          title={t('account.password.title')}
          subtitle={t('account.password.sub_title')}
        >
          <Form
            route="settings.account.execute"
            className="grid gap-6"
            onBefore={(visit) => {
              const isValid = validationPasswordForm.validateAll(visit.data as Record<string, any>)
              if (!isValid) return false
            }}
          >
            {({ errors, processing }) => (
              <>
                <input type="hidden" name="_action" value="update_password" />
                <Field
                  label={t('account.password.current.value')}
                  name="current_password"
                  type="password"
                  errorMessage={errors.current_password || validationPasswordForm.getValidationMessage('current_password')}
                  onChange={(event) => {
                    validationPasswordForm.handleChange('current_password', event.target.value)
                  }}
                  onBlur={(event) => {
                    validationPasswordForm.handleBlur('current_password', event.target.value)
                  }}
                  required
                  sanitize
                />
                <Field
                  label={t('account.password.new.value')}
                  name="password"
                  type="password"
                  errorMessage={errors.password || validationPasswordForm.getValidationMessage('password')}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    validationPasswordForm.handleChange('password', event.target.value)
                    validationPasswordForm.handleChange('password_confirmation', confirmPassword)
                  }}
                  onBlur={(event) => {
                    setPassword(event.target.value)
                    validationPasswordForm.handleBlur('password', event.target.value)
                    validationPasswordForm.handleBlur('password_confirmation', confirmPassword)
                  }}
                  required
                  sanitize={false}
                  helpText={t('account.password.new.help')}
                  helpClassName={validationPasswordForm.getHelpClassName('password')}
                />
                <Field
                  label={t('account.password.confirm.value')}
                  name="password_confirmation"
                  type="password"
                  errorMessage={
                    errors.password_confirmation ||
                    validationPasswordForm.getValidationMessage('password_confirmation')
                  }
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    validationPasswordForm.handleChange('password_confirmation', event.target.value)
                  }}
                  onBlur={(event) => {
                    setConfirmPassword(event.target.value)
                    validationPasswordForm.handleBlur('password_confirmation', event.target.value)
                  }}
                  required
                  sanitize={false}
                  helpText={t('account.password.confirm.help')}
                  helpClassName={validationPasswordForm.getHelpClassName('password_confirmation')}
                />
                <Button
                  loading={processing}
                  type={"submit"}
                  fitContent
                >
                  {t('account.password.submit')}
                </Button>
              </>
            )}
          </Form>
        </Card>
        <Card
          title={t('account.delete.title')}
          subtitle={t('account.delete.sub_title')}
          border="danger"
        >
          {!showDeleteConfirm ? (
            <Button variant="danger" fitContent onClick={() => setShowDeleteConfirm(true)}>
              {t('account.delete.submit')}
            </Button>
          ) : (<div className="grid gap-4">
            <Banner
              title={t('account.delete.confirm.title')}
              message={t('account.delete.confirm.sub_title')}
              type="danger"
            />
            <Form
              route="settings.account.destroy"
              className="grid gap-6"
              onBefore={(visit) => {
                const isValid = validationDeleteForm.validateAll(visit.data as Record<string, any>)
                if (!isValid) return false
              }}
            >
              {({ errors, processing, reset }) => (
                <>
                  <Field
                    label={t('account.delete.password')}
                    name="password"
                    type="password"
                    errorMessage={errors.password || validationDeleteForm.getValidationMessage('password')}
                    onChange={(event) => {
                      validationDeleteForm.handleChange('password', event.target.value)
                    }}
                    onBlur={(event) => {
                      validationDeleteForm.handleBlur('password', event.target.value)
                    }}
                    required
                    sanitize={false}
                    helpClassName={validationDeleteForm.getHelpClassName('password')}
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      fitContent
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        reset("password")
                        validationDeleteForm.reset()
                      }}
                    >
                      {t('account.delete.cancel')}
                    </Button>
                    <Button
                      loading={processing}
                      type={"submit"}
                      fitContent
                      variant="danger"
                    >
                      {t('account.delete.submit')}
                    </Button>
                  </div>
                </>
              )}
            </Form>
          </div>)
          }
        </Card>
      </SettingsLayout>
    </>
  )
}
