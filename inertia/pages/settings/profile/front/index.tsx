import { SettingsLayout } from '~/components/organisms/settings_layout'
import { useTranslation } from 'react-i18next'
import { Card } from '~/components/atoms/card'
import { Form } from '@adonisjs/inertia/react'
import { useFormValidation } from '~/hooks/use_form_validation'
import { presets } from '~/helpers/validation_rules'
import { Field } from '~/components/molecules/field'
import { Button } from '~/components/atoms/button'
import { Avatar } from '~/components/atoms/avatar'
import { Label } from '~/components/atoms/label'
import { Data } from '@generated/data'

interface PageProps {
  user: Data.User
}

export default function ProfilePage(props: PageProps) {
  const { user } = props

  const { t } = useTranslation('settings')

  const validation = useFormValidation({
    username: presets.username,
  })

  return (
    <>
      <SettingsLayout
        tab='profile'
      >
        <Card
          title={t('profile.title')}
          subtitle={t('profile.sub_title')}
        >
          <Form
            route="settings.profile.execute"
            className="grid gap-6"
            onBefore={(visit) => {
              const isValid = validation.validateAll(visit.data as Record<string, any>)
              if (!isValid) return false
            }}
          >
            {({ errors, processing }) => (
              <>
                <div className="grid gap-2">
                  <Label
                    label={t('profile.avatar.value')}
                    htmlFor="avatar"
                  />
                  <div className="flex gap-4">
                    <Avatar />
                    <Button
                      variant="outline"
                      fitContent
                    >
                      {t('profile.avatar.change')}
                    </Button>
                  </div>
                </div>
                <Field
                  label={t('profile.username.value')}
                  name="username"
                  type="text"
                  defaultValue={user.username || ''}
                  placeholder={t('profile.username.placeholder')}
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
                <Button
                  loading={processing}
                  type={"submit"}
                  fitContent
                >
                  {t('profile.submit')}
                </Button>
              </>
            )}
          </Form>
        </Card>
      </SettingsLayout>
    </>
  )
}
