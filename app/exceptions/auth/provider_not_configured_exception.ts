import { Exception } from '@adonisjs/core/exceptions'

export default class ProviderNotConfiguredException extends Exception {
  provider: string
  static status = 501
  static code = 'E_PROVIDER_NOT_CONFIGURED'

  constructor(provider: string) {
    super(`The OAuth provider "${provider}" is not configured on this server.`, {
      status: ProviderNotConfiguredException.status,
      code: ProviderNotConfiguredException.code,
    })
    this.provider = provider
  }
}
