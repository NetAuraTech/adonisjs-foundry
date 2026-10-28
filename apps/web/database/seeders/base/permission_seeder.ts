import { BaseSeeder } from '@adonisjs/lucid/seeders';
import Permission from '#identity/models/permission';
import { permissionCatalog } from '#start/permissions';

export default class extends BaseSeeder {
	async run() {
		/**
		 * Flatten the composed permission catalog (single source of the
		 * persisted slugs) into permission rows, then upsert each permission
		 * into the database.
		 */
		const permissions = Object.entries(permissionCatalog as Record<string, readonly string[]>).flatMap(
			([category, actions]) =>
				actions.map((action) => ({
					name: `permissions.${category}.${action}.value`,
					slug: `${category}.${action}`,
					category: `permissions.category.${category}`,
					description: `permissions.${category}.${action}.description`,
					isSystem: true,
				})),
		);

		/**
		 * Upsert sequentially on the single warm pool connection: the seeder is
		 * the only workload, so a burst of 35 concurrent queries only scales the
		 * pool to `max`, and the reaped connections race the pool teardown at
		 * process exit (unhandled "aborted" rejection, non-zero exit code).
		 */
		for (const permission of permissions) {
			await Permission.updateOrCreate({ slug: permission.slug }, permission);
		}

		console.log('✅ Permissions seeded successfully');
		console.log(`  - Created ${permissions.length} permissions`);
	}
}
