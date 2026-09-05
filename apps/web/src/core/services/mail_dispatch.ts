import { GetPreferencesAction } from '#account/actions/preferences/get_preferences_action';
import { routePath } from '#core/services/route_path';
import env from '#start/env';
import type { FullToken } from '#auth/enums/token_type';
import type User from '#identity/models/user';

/**
 * Resolves the recipient's locale from their preferences, falling back to
 * `en`.
 *
 * Shared by the auth and account mail services so the preference-based
 * locale resolution lives in a single kernel home.
 *
 * @param getPreferencesAction - The account-domain action that loads the user's preferences.
 * @param user - The recipient the mail is addressed to.
 * @returns The locale code to render the mail in.
 *
 * @example
 * const locale = await resolveMailLocale(getPreferencesAction, user)
 */
export async function resolveMailLocale(getPreferencesAction: GetPreferencesAction, user: User): Promise<string> {
	const preferences = await getPreferencesAction.execute({ user });
	return preferences.locale || 'en';
}

/**
 * Builds the mail link for the current flavor.
 *
 * The full flavor links to the session pages; the headless `api` flavor
 * falls back to the token API endpoints. The first registered route wins.
 *
 * @param routeNames - Candidate route names, in priority order.
 * @param token - The token carried by the link.
 * @returns The absolute URL, or an empty string when no candidate is
 *   registered.
 *
 * @example
 * const link = buildMailLink(['auth.reset_password.render', 'api.v1.auth.reset_password.store'], token)
 */
export function buildMailLink(routeNames: string[], token: FullToken): string {
	for (const name of routeNames) {
		const path = routePath(name, { token });
		if (path) return `${env.get('APP_URL')}${path}`;
	}
	return '';
}
