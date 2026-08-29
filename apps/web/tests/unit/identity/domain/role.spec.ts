import { test } from '@japa/runner';
import { Role } from '#identity/domain/role';
import { RoleIdentifier } from '#identity/domain/identifiers';

const model = (overrides: Partial<{ id: number; slug: string; isSystem: boolean; permissions: { slug: string }[] | null }> = {}) => ({
	id: overrides.id ?? 1,
	slug: overrides.slug ?? 'editor',
	isSystem: overrides.isSystem ?? false,
	permissions: overrides.permissions ?? [],
});

/**
 * Unit tests for the {@link Role} domain object.
 */
test.group('Role', () => {
	test('fromModel() hydrates the identity through a RoleIdentifier', ({ assert }) => {
		const role = Role.fromModel(model({ id: 5, permissions: [{ slug: 'pages.view' }] }));

		assert.isTrue(role.id instanceof RoleIdentifier);
		assert.equal(role.id.value, 5);
		assert.isTrue(role.hasPermission('pages.view'));
	});

	test('fromModel() tolerates a missing permissions relation', ({ assert }) => {
		const role = Role.fromModel(model({ permissions: null }));

		assert.isFalse(role.hasPermission('pages.view'));
	});

	test('the admin slug is the administrator role', ({ assert }) => {
		assert.isTrue(Role.fromModel(model({ slug: 'admin' })).isAdmin());
		assert.isFalse(Role.fromModel(model({ slug: 'editor' })).isAdmin());
	});

	test('system roles are immutable and undeletable', ({ assert }) => {
		const role = Role.fromModel(model({ isSystem: true }));

		assert.isFalse(role.canBeModified());
		assert.isFalse(role.canBeDeleted());
	});

	test('custom roles may be modified and deleted', ({ assert }) => {
		const role = Role.fromModel(model({ isSystem: false }));

		assert.isTrue(role.canBeModified());
		assert.isTrue(role.canBeDeleted());
	});

	test('equals() compares identities, not fields', ({ assert }) => {
		const a = Role.fromModel(model({ id: 1 }));
		const b = Role.fromModel(model({ id: 1, slug: 'other' }));
		const c = Role.fromModel(model({ id: 2 }));

		assert.isTrue(a.equals(b));
		assert.isFalse(a.equals(c));
	});
});
