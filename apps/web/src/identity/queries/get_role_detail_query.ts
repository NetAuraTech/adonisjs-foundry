import Role from '#identity/models/role';

/**
 * Read-side query for a single role by primary key, preloading its permissions
 * and assigned users. Returns `null` when no role matches the id.
 */
export class GetRoleDetailQuery {
	/**
	 * Execute the role detail query.
	 *
	 * @param id - The role primary key to fetch.
	 * @returns The role with `permissions` and `users` relations loaded, or `null`.
	 */
	async execute(id: number): Promise<Role | null> {
		return Role.query().where('id', id).preload('permissions').preload('users').first();
	}
}
