import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { afterFetch, afterFind, beforeSave, belongsTo, computed, hasMany, hasOne } from '@adonisjs/lucid/orm'
import Role from '#models/auth/role'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import UserPreference from '#models/preferences/user_preference'
import Token from '#models/core/token'
import { TOKEN_TYPES } from '#types/core'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(UserSchema, AuthFinder) {
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @hasOne(() => UserPreference)
  declare preference: HasOne<typeof UserPreference>

  @hasMany(() => Token)
  declare tokens: HasMany<typeof Token>

  declare hasPendingInvite: boolean

  /** In-memory cache of the role + permissions loaded by can() / checkAny(). */
  private _loadedRole: Role | null | undefined = undefined

  @beforeSave()
  static invalidateRoleCache(user: User, event: 'update' | 'create') {
    // Invalidate the in-memory role cache on updates so a changed roleId is picked up.
    if (event === 'update') {
      user._loadedRole = undefined
    }
  }

  @afterFind()
  static async loadPendingInvite(user: User) {
    if (!user?.id) {
      return
    }
    user.hasPendingInvite = false

    const token = await Token.query()
      .where('type', TOKEN_TYPES.PENDING_INVITE)
      .where('user_id', user.id)
      .first()

    user.hasPendingInvite = !!token && !user.isEmailVerified
  }

  @afterFetch()
  static async loadPendingInviteAll(users: User[]) {
    await Promise.all(users.map(User.loadPendingInvite))
  }

  @computed()
  get status(): string {
    if (this.hasPendingInvite) return TOKEN_TYPES.PENDING_INVITE
    if (this.isEmailVerified) return 'VERIFIED'
    return 'UNVERIFIED'
  }

  get isEmailVerified(): boolean {
    return this.emailVerifiedAt !== null && this.emailVerifiedAt !== undefined
  }

  /**
   * Load the role with permissions once, caching it on the instance.
   */
  async _loadRole(): Promise<Role | null> {
    if (this._loadedRole !== undefined) {
      return this._loadedRole
    }

    if (!this.roleId) {
      this._loadedRole = null
      return null
    }

    const role = await (this as User).related('role').query().preload('permissions').first()
    this._loadedRole = role ?? null
    return role
  }

  /**
   * Check if the user has a specific permission slug.
   * Reuses the cached role on subsequent calls to avoid N+1 queries.
   */
  async can(slug: string): Promise<boolean> {
    const role = await this._loadRole()
    if (!role) {
      return false
    }
    return role.permissions.some((p) => p.slug === slug)
  }

  /**
   * Check if the user has any of the given permission slugs.
   * Loads the role + permissions once and checks all slugs in a single pass.
   */
  async checkAny(slugs: string[]): Promise<boolean> {
    const role = await this._loadRole()
    if (!role) {
      return false
    }
    return slugs.some((slug) => role.permissions.some((p) => p.slug === slug))
  }

  async hasAnyRole(slugs: string[]): Promise<boolean> {
    if (!this.roleId) {
      return false
    }

    const role = await (this as User).related('role').query().first()
    return role ? slugs.includes(role.slug) : false
  }
}
