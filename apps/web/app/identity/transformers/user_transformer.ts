import { BaseTransformer } from '@adonisjs/core/transformers';
import RoleTransformer from '#app/identity/transformers/role_transformer';
import type User from '#identity/models/user';

export default class UserTransformer extends BaseTransformer<User> {
	toObject() {
		return {
			...this.pick(this.resource, ['id', 'username', 'email', 'status', 'emailVerifiedAt', 'createdAt', 'updatedAt']),
			connectedProviders: {
				github: !!this.resource.githubId,
				google: !!this.resource.googleId,
				facebook: !!this.resource.facebookId,
			},
			role: RoleTransformer.transform(this.resource.role),
			permissions: this.resource.role?.permissions?.map((p) => p.slug) ?? [],
		};
	}
}
