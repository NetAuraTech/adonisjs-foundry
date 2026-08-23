import { BaseTransformer } from '@adonisjs/core/transformers';
import PermissionTransformer from '#transformers/permission_transformer';
import UserTransformer from '#transformers/user_transformer';
import type Role from '#models/auth/role';

export default class RoleTransformer extends BaseTransformer<Role> {
	toObject() {
		return {
			...this.pick(this.resource, ['id', 'name', 'slug', 'description', 'isSystem', 'createdAt', 'updatedAt']),
			permissions: PermissionTransformer.transform(this.whenLoaded(this.resource.permissions)),
			users: UserTransformer.transform(this.whenLoaded(this.resource.users)),
			usersCount:
				this.resource.$extras.users_count !== undefined ? Number(this.resource.$extras.users_count) : undefined,
		};
	}
}
