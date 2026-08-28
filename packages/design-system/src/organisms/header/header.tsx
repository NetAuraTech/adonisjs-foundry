import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { cn, tv } from 'tailwind-variants';
import { NavLink } from '../../atoms/nav_link/nav_link';
import { useNavLinkActive } from '../../hooks/use_nav_link_active';

/**
 * A single primary-navigation entry for the {@link Header}.
 *
 * The `href` is resolved by the caller (e.g. with a typed `urlFor`) — the
 * header never resolves routes itself.
 */
export interface HeaderLink {
	/** Visible link text. */
	label: string;
	/** Resolved URL the link navigates to. */
	href: string;
}

const header = tv({
	base: 'header',
});

interface HeaderProps {
	/** The application name, rendered as the logo link. */
	appName: string;
	/**
	 * Primary navigation links, rendered in order inside the nav. Hrefs are
	 * built by the caller; active state is derived from the current URL.
	 */
	links: HeaderLink[];
	/** Additional Tailwind classes merged onto the `<header>`. */
	className?: string;
}

/**
 * Renders one navigation entry, computing its active state from the current
 * URL. Kept as a private child so `useNavLinkActive` is called once per entry
 * at the top level rather than inside a list callback.
 */
function HeaderNavLink(props: { link: HeaderLink; onClick?: () => void }) {
	const { link, onClick } = props;

	return (
		<NavLink
			href={link.href}
			label={link.label}
			variant="nav"
			isActive={useNavLinkActive(link.href)}
			onClick={onClick}
		/>
	);
}

/**
 * Public-facing top bar.
 *
 * Shows the application name as a home link, the injected primary navigation,
 * and a burger toggle that opens the navigation on small viewports. All data —
 * the app name and the resolved link hrefs — is injected by the caller; the
 * header owns no app data and resolves no routes. Menu open/close state and the
 * "close on navigation" behaviour are internal presentation concerns.
 *
 * @example
 * <Header
 *   appName="Foundry"
 *   links={[{ label: 'Home', href: urlFor('core.home.render') }]}
 * />
 */
export function Header(props: HeaderProps) {
	const { appName, links, className } = props;
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const closeMenu = () => {
		setIsMenuOpen(false);
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	};

	useEffect(() => {
		const unregisterListener = router.on('success', () => {
			setIsMenuOpen(false);
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		});

		return () => unregisterListener();
	}, []);

	const menuState = isMenuOpen ? 'opened' : 'closed';
	const isExpanded = isMenuOpen ? 'true' : 'false';
	const homeHref = links[0]?.href ?? '/';

	return (
		<header className={cn(header(), className)} data-state={menuState} aria-expanded={isExpanded}>
			<Link
				href={homeHref}
				className="header__logo font-semibold tracking-wide text-xl font-cormorant"
				onClick={closeMenu}
			>
				{appName}
			</Link>

			<nav id="primary-navigation" className="header__nav" data-state={menuState} aria-expanded={isExpanded}>
				{links.map((link) => (
					<HeaderNavLink key={link.href} link={link} onClick={closeMenu} />
				))}
			</nav>
			<button
				className="header__burger md:display-hidden"
				aria-controls="primary-navigation"
				aria-expanded={isExpanded}
				data-state={menuState}
				aria-label="Menu"
				onClick={toggleMenu}
			>
				<svg stroke="currentColor" fill="none" className="hamburger" viewBox="-10 -10 120 120" width="50">
					<path
						className="line"
						strokeWidth="6"
						strokeLinecap="round"
						strokeLinejoin="round"
						d="m 20 40 h 60 a 1 1 0 0 1 0 20 h -60 a 1 1 0 0 1 0 -40 h 30 v 70"
					></path>
				</svg>
			</button>
		</header>
	);
}
