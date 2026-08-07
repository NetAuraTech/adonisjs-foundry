import { BaseHttpException } from '#exceptions/base_http_exception'

export default class MissingRevisionException extends BaseHttpException {
  static status = 404
  static code = 'E_MISSING_REVISION'

  constructor(protected revisionId: number) {
    super(`Revision ${revisionId} not found.`)
  }

  protected details() {
    return { revisionId: this.revisionId }
  }

  protected i18nParams() {
    return { revisionId: this.revisionId }
  }
}
