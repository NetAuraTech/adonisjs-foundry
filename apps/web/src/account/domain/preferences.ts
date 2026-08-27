import { DEFAULT_PREFERENCES, type Locale, type Theme, type UserPreferences } from '#account/types/preferences';

/**
 * Pure domain object for a user's preferences.
 *
 * Encapsulates the preference-resolution rules outside the persistence
 * layer. The Lucid `UserPreference` model is the persistence
 * representation; this object carries the resolved theme and locale, with
 * the fallback to {@link DEFAULT_PREFERENCES} applied at hydration time.
 * Hydrate one from a model row (or a missing row) with
 * {@link UserPreference.fromModel}.
 */
export class UserPreference {
	private constructor(
		readonly theme: Theme,
		readonly locale: Locale,
	) {}

	/**
	 * Hydrate a domain preference from its persisted row, applying the
	 * defaults to any absent value. A `null` row (no preference stored yet)
	 * resolves to {@link DEFAULT_PREFERENCES}.
	 *
	 * @param model - The preferences row for a user, or `null` when none exists.
	 */
	static fromModel(model: { theme?: Theme | null; locale?: Locale | null } | null): UserPreference {
		return new UserPreference(model?.theme ?? DEFAULT_PREFERENCES.theme, model?.locale ?? DEFAULT_PREFERENCES.locale);
	}

	/** The fallback preference for a user with no stored row (or a guest). */
	static defaults(): UserPreference {
		return new UserPreference(DEFAULT_PREFERENCES.theme, DEFAULT_PREFERENCES.locale);
	}

	/** The resolved preferences as the plain {@link UserPreferences} shape consumed by the frontend. */
	toPreferences(): UserPreferences {
		return { theme: this.theme, locale: this.locale };
	}
}
