import { Exception } from '@adonisjs/core/exceptions'

export default class ProviderAlreadyLinkedException extends Exception {
  provider: string
  static status = 409
  static code = 'E_PROVIDER_ALREADY_LINKED'

  constructor(provider: string) {
    super(`The "${provider}" account is already linked to another user.`, {
      status: ProviderAlreadyLinkedException.status,
      code: ProviderAlreadyLinkedException.code,
    })
    this.provider = provider
  }
}
