import {useTranslation} from "react-i18next";
import {Button} from "~/components/atoms/button";
import type { OAuthProvider } from '#types/auth_type'
import { capitalize } from '~/lib/string'

interface AuthProviderProps {
  providers: OAuthProvider[]
}

export function AuthProviders(props: AuthProviderProps) {
  const { providers } = props
  const { t } = useTranslation('auth')

  const getIcon = (provider: OAuthProvider) => {
    switch (provider) {
      default:
        return <></>
    }
  }

  return <>
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-solid border-t-1 border-neutral-300"></div>
      </div>
      <div className="relative flex justify-center text-lg">
        <span className="px-4 bg-neutral-50">
          {t('login.or_continue_with')}
        </span>
      </div>
    </div>
    <div className="grid grid-auto-fit-[250px] gap-3">
      {
        providers && providers.map(provider => <Button
          variant="social"
          route="auth.social.redirect"
          routeParams={{ provider: provider }}
          key={`provider-${provider}`}
          title={capitalize(provider)}
          external
        >
          <svg
            className="w-6 h-6 mr-4"
            viewBox="0 0 24 24"
            dangerouslySetInnerHTML={{ __html: getIcon(provider) }}
          />
          {capitalize(provider)}
        </Button>)
      }
    </div>
  </>
}
