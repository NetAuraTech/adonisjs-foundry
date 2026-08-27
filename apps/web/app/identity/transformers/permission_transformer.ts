import { BaseTransformer } from '@adonisjs/core/transformers';
import type Permission from '#identity/models/permission';

export default class PermissionTransformer extends BaseTransformer<Permission> {
	toObject() {
		return {
			...this.pick(this.resource, [
				'id',
				'name',
				'slug',
				'description',
				'category',
				'isSystem',
				'createdAt',
				'updatedAt',
			]),
		};
	}
}
