import { SettingsLayout } from '~/components/organisms/settings_layout'
import { useTranslation } from 'react-i18next'
import { Card } from '~/components/atoms/card'
import { Form } from '@adonisjs/inertia/react'
import { useFormValidation } from '~/hooks/use_form_validation'
import { rules } from '~/helpers/validation_rules'
import { Button } from '~/components/atoms/button'
import { Field } from '~/components/molecules/field'
import { usePage } from '@inertiajs/react'
import type { SharedProps } from '@adonisjs/inertia/types'
import { SelectOption } from '~/components/atoms/select_option'
import i18n from 'i18next'
import type { Locale } from '#types/preferences'
import { ThemeToggle } from '~/components/molecules/theme_toggle'
import { Label } from '~/components/atoms/label'
export default function PreferencesPage() {
  const { t } = useTranslation('settings')

  const pageProps = usePage<SharedProps>().props

  const validationLocale = useFormValidation({
    locale: [rules.required(), rules.minLength(2), rules.maxLength(2)],
  })

  return (
    <>
      <SettingsLayout
        tab='preferences'
      >
        <Card
          title={t('preferences.interface.title')}
          subtitle={t('preferences.interface.sub_title')}
        >
          <Form
            route="settings.preferences.execute"
            className="grid gap-6"
            onBefore={(visit) => {
              const isValid = validationLocale.validateAll(visit.data as Record<string, any>)
              if (!isValid) return false
            }}
            onSuccess={(data) => {
              if (pageProps.preferences?.locale !== data.props.locale) {
                i18n.changeLanguage(data.props.locale as Locale)
              }
            }}
          >
            {({ errors, processing }) => (
              <>
                <Field
                  label={t('preferences.interface.locale.value')}
                  name="locale"
                  type="select"
                  defaultValue={pageProps.preferences?.locale || 'en'}
                  errorMessage={errors.locale || validationLocale.getValidationMessage('locale')}
                  onChange={(event) => {
                    validationLocale.handleChange('locale', event.target.value)
                  }}
                  onBlur={(event) => {
                    validationLocale.handleBlur('locale', event.target.value)
                  }}
                  required
                  sanitize
                >
                  <SelectOption
                    value="en"
                    label={t('preferences.interface.locale.english')}
                  />
                  <SelectOption
                    value="fr"
                    label={t('preferences.interface.locale.french')}
                  />
                </Field>
                <Button
                  loading={processing}
                  type={"submit"}
                  fitContent
                >
                  {t('preferences.interface.submit')}
                </Button>
              </>
            )}
          </Form>
        </Card>
        <Card
          title={t('preferences.appearance.title')}
          subtitle={t('preferences.appearance.sub_title')}
        >
          <div className="flex gap-4">
            <Label
              label={t('preferences.appearance.value')}
              htmlFor="theme"
            />
            <ThemeToggle />
          </div>
        </Card>
      </SettingsLayout>
    </>
  )
}
