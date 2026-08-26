import UserPreference from '#account/models/user_preference';

/**
 * Read-side query fetching a user's preferences row.
 */
export class GetUserPreferenceQuery {
	/**
	 * Execute the preferences lookup query.
	 *
	 * @param userId - The owner of the preferences row.
	 * @returns The {@link UserPreference} row, or `null` when none exists yet.
	 */
	async execute(userId: UserPreference['userId']): Promise<UserPreference | null> {
		return UserPreference.query().where('userId', userId).first();
	}
}
