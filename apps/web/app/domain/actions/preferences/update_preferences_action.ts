import { inject } from '@adonisjs/core';
import { withTransaction } from '#core/services/with_transaction';
import PreferencesRepository from '#repositories/preferences/preferences_repository';
import { DEFAULT_PREFERENCES, type UserPreferences } from '#types/preferences';
import type User from '#identity/models/user';

interface UpdatePreferencesPayload {
	user: User;
	data: Partial<UserPreferences>;
}

/**
 * Update user preferences by upserting them atomically.
 */
@inject()
export class UpdatePreferencesAction {
	constructor(private preferencesRepository: PreferencesRepository) {}

	/**
	 * Execute preferences update.
	 *
	 * @param payload - Authenticated user and preference data to merge.
	 * @returns The merged {@link UserPreferences} with defaults applied.
	 */
	async execute(payload: UpdatePreferencesPayload): Promise<UserPreferences> {
		const preference = await withTransaction(async () => {
			return this.preferencesRepository.upsert(payload.user, payload.data);
		});

		return {
			theme: preference.theme ?? DEFAULT_PREFERENCES.theme,
			locale: preference.locale ?? DEFAULT_PREFERENCES.locale,
		};
	}
}
