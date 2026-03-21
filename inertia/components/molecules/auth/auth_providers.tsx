import { useTranslation } from 'react-i18next'
import { Button } from '~/components/atoms/button'
import type { OAuthProvider } from '#types/auth'
import { capitalize } from '~/lib/string'
import { getIcon } from '~/helpers/oauth'

interface AuthProviderProps {
  providers: OAuthProvider[]
}

export function AuthProviders(props: AuthProviderProps) {
  const { providers } = props
  const { t } = useTranslation('auth')

  return (
    <>
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-solid border-edge" />
        </div>
        <div className="relative flex justify-center text-lg">
          <span className="px-4 bg-canvas text-ink-muted">{t('login.or_continue_with')}</span>
        </div>
      </div>
      <div className="grid grid-auto-fit-[250px] gap-3">
        {providers &&
          providers.map((provider) => (
            <Button
              variant="social"
              route="auth.social.redirect"
              routeParams={{ provider: provider }}
              key={`provider-${provider}`}
              title={capitalize(provider)}
              external
            >
              {getIcon(provider)}
              {capitalize(provider)}
            </Button>
          ))}
      </div>
    </>
  )
}
