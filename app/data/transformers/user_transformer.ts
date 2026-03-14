import { BaseTransformer } from '@adonisjs/core/transformers'
import type User from '#models/auth/user'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'username', 'email', 'createdAt', 'updatedAt']),
      connectedProviders: {
        github: !!this.resource.githubId,
        google: !!this.resource.googleId,
        facebook: !!this.resource.facebookId,
      },
      role: this.resource.role?.slug ?? null,
      permissions: this.resource.role?.permissions?.map((p) => p.slug) ?? [],
    }
  }
}
