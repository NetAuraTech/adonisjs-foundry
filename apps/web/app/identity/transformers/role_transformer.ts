import { BaseTransformer } from '@adonisjs/core/transformers';
import PermissionTransformer from '#app/identity/transformers/permission_transformer';
import UserTransformer from '#app/identity/transformers/user_transformer';
import type { Role } from '#identity/domain/role';

export default class RoleTransformer extends BaseTransformer<Role> {
	toObject() {
		return {
			id: this.resource.id.value,
			name: this.resource.name,
			slug: this.resource.slug,
			description: this.resource.description,
			isSystem: this.resource.isSystem,
			createdAt: this.resource.createdAt,
			updatedAt: this.resource.updatedAt,
			permissions: this.resource.permissions
				? PermissionTransformer.transform([...this.resource.permissions])
				: undefined,
			users: this.resource.users ? UserTransformer.transform([...this.resource.users]) : undefined,
			usersCount: this.resource.usersCount ?? undefined,
		};
	}
}
