import { Exception } from '@adonisjs/core/exceptions'
import { type LucidModel } from '@adonisjs/lucid/types/model'

export default class RowNotFoundException extends Exception {
  static readonly status: number = 404
  static readonly code: string = 'E_ROW_NOT_FOUND'
  static readonly message: string = 'Row not found'

  model?: LucidModel

  constructor(model?: LucidModel) {
    super()
    this.model = model
  }
}
