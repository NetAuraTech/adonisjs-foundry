import { test } from '@japa/runner';
import { Permission } from '#identity/domain/permission';
import { PermissionIdentifier } from '#identity/domain/identifiers';

/**
 * Unit tests for the {@link Permission} domain object.
 */
test.group('Permission', () => {
	test('fromModel() hydrates the identity through a PermissionIdentifier', ({ assert }) => {
		const permission = Permission.fromModel({ id: 3, slug: 'files.delete', category: 'file', isSystem: false });

		assert.isTrue(permission.id instanceof PermissionIdentifier);
		assert.equal(permission.id.value, 3);
		assert.equal(permission.slug, 'files.delete');
		assert.equal(permission.category, 'file');
		assert.isFalse(permission.isSystem);
	});

	test('system permissions are immutable and undeletable', ({ assert }) => {
		const permission = Permission.fromModel({ id: 1, slug: 'users.view', category: 'identity', isSystem: true });

		assert.isFalse(permission.canBeModified());
		assert.isFalse(permission.canBeDeleted());
	});

	test('custom permissions may be modified and deleted', ({ assert }) => {
		const permission = Permission.fromModel({ id: 2, slug: 'custom.one', category: 'misc', isSystem: false });

		assert.isTrue(permission.canBeModified());
		assert.isTrue(permission.canBeDeleted());
	});

	test('equals() compares identities, not fields', ({ assert }) => {
		const a = Permission.fromModel({ id: 1, slug: 'a', category: 'c', isSystem: false });
		const b = Permission.fromModel({ id: 1, slug: 'other', category: 'other', isSystem: true });
		const c = Permission.fromModel({ id: 2, slug: 'a', category: 'c', isSystem: false });

		assert.isTrue(a.equals(b));
		assert.isFalse(a.equals(c));
	});
});
