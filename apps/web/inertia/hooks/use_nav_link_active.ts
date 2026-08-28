import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Determines whether the current page matches a resolved href.
 *
 * The design system's `<NavLink>` is a pure presentation atom: it renders the
 * active styles only when the caller passes `isActive`. This hook performs the
 * matching so call sites can write `isActive={useNavLinkActive(href)}`.
 *
 * Matching mirrors the previous built-in behaviour:
 * - **Path** — `window.location.pathname` equals the href's path (query string
 *   and fragment stripped from the href).
 * - **Fragment** — when the href carries a `#anchor`, the current URL hash must
 *   equal it. Links without a fragment match regardless of the current hash.
 *
 * The check re-runs on every Inertia `finish` event, so the active state stays
 * correct across client-side navigation.
 *
 * @param href - The resolved URL to test (e.g. from `urlFor`).
 * @returns `true` while the current page matches `href`.
 *
 * @example
 * const href = urlFor('account.profile.render');
 * <NavLink href={href} isActive={useNavLinkActive(href)} label="Profile" />
 */
export function useNavLinkActive(href: string): boolean {
	const { url } = usePage();
	const [active, setActive] = useState(false);

	useEffect(() => {
		const determineActive = () => {
			let targetPath = href;
			let targetAnchor = '';

			const hashIndex = href.indexOf('#');
			if (hashIndex >= 0) {
				targetPath = href.slice(0, hashIndex);
				targetAnchor = href.slice(hashIndex + 1);
			}

			const queryIndex = targetPath.indexOf('?');
			if (queryIndex >= 0) {
				targetPath = targetPath.slice(0, queryIndex);
			}

			const pathMatches = window.location.pathname === targetPath;
			const anchorMatches = targetAnchor === window.location.hash.replace('#', '');

			setActive(pathMatches && anchorMatches);
		};

		determineActive();

		const removeFinishEventListener = router.on('finish', determineActive);

		return removeFinishEventListener;
	}, [url, href]);

	return active;
}
