import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { belongsTo } from '@adonisjs/lucid/orm'
import Role from '#models/auth/role'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  get isEmailVerified(): boolean {
    return this.emailVerifiedAt !== null
  }
}
