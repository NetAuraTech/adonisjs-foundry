import User from '#identity/models/user';

/**
 * Read-side query for a single user by primary key, preloading the user's role
 * with its permissions. Returns `null` when no user matches the id.
 */
export class GetUserDetailQuery {
	/**
	 * Execute the user detail query.
	 *
	 * @param id - The user primary key to retrieve.
	 * @returns The {@link User} with role and permissions preloaded, or `null`.
	 */
	async execute(id: number): Promise<User | null> {
		const user = await User.query().where('id', id).first();

		if (!user) {
			return null;
		}

		await user.load('role', (query) => {
			query.preload('permissions');
		});

		return user;
	}
}
