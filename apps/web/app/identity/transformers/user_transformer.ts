import { BaseTransformer } from '@adonisjs/core/transformers';
import RoleTransformer from '#app/identity/transformers/role_transformer';
import type { User } from '#identity/domain/user';

export default class UserTransformer extends BaseTransformer<User> {
	toObject() {
		return {
			id: this.resource.id.value,
			username: this.resource.username,
			email: this.resource.email,
			status: this.resource.status(),
			emailVerifiedAt: this.resource.emailVerifiedAt,
			createdAt: this.resource.createdAt,
			updatedAt: this.resource.updatedAt,
			connectedProviders: {
				github: this.resource.hasGithubId,
				google: this.resource.hasGoogleId,
				facebook: this.resource.hasFacebookId,
			},
			role: RoleTransformer.transform(this.resource.role),
			permissions: this.resource.role?.permissions?.map((p) => p.slug) ?? [],
		};
	}
}
