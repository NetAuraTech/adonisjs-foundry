import { BaseTransformer } from '@adonisjs/core/transformers';
import type { Permission } from '#identity/domain/permission';

export default class PermissionTransformer extends BaseTransformer<Permission> {
	toObject() {
		return {
			id: this.resource.id.value,
			name: this.resource.name,
			slug: this.resource.slug,
			description: this.resource.description,
			category: this.resource.category,
			isSystem: this.resource.isSystem,
			createdAt: this.resource.createdAt,
			updatedAt: this.resource.updatedAt,
		};
	}
}
