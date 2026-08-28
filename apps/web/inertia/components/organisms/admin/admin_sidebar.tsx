import { SharedProps } from '@adonisjs/inertia/types';
import { Avatar } from '@foundry/design-system/avatar';
import { Card } from '@foundry/design-system/card';
import { Heading } from '@foundry/design-system/heading';
import { Icon } from '@foundry/design-system/icon';
import { NavLink } from '@foundry/design-system/nav-link';
import { usePage } from '@inertiajs/react';
import { urlFor } from '~/client';
import { ThemeToggle } from '~/components/molecules/theme_toggle';
import { CanAccess } from '~/guards/can_access';
import { useMenu } from '~/hooks/use_admin';
import { useAuth } from '~/hooks/use_auth';
import { useNavLinkActive } from '~/hooks/use_nav_link_active';
import { Lang, useTranslation } from '~/hooks/use_translation';

interface AdminSidebarProps {
	/**
	 * Whether the sidebar is currently open. Forwarded to `aria-expanded` on
	 * the `<aside>` element so CSS transitions and screen readers react to the
	 * state change.
	 */
	sidebarOpen: boolean;
}

/**
 * Collapsible navigation sidebar for the admin layout.
 *
 * Composed of two `<Card>` sections:
 *
 * 1. **User card** — shows the authenticated user's avatar, username, the
 *    current date (formatted in the active locale), and the `<ThemeToggle>`.
 * 2. **Navigation card** — renders the menu entries returned by `useMenu`,
 *    grouped by category. Each entry is wrapped in a `<CanAccess>` guard so
 *    links the user lacks permission for are silently hidden.
 *
 * Visibility is controlled by CSS via the `aria-expanded` attribute on the
 * `<aside>` and the `.sidebar` utility class defined in `app.css`. The
 * parent layout is responsible for toggling `sidebarOpen`.
 *
 * @example
 * const [sidebarOpen, setSidebarOpen] = useState(false)
 *
 * <AdminHeader handleClick={() => setSidebarOpen((v) => !v)} />
 * <AdminSidebar sidebarOpen={sidebarOpen} />
 */
interface AdminMenuEntryProps {
	label: string;
	route: string;
	routeParams?: Record<string, any>;
	icon?: string;
}

function AdminMenuEntry(props: AdminMenuEntryProps) {
	const { label, route, routeParams, icon } = props;
	const href = urlFor(route as any, routeParams as any);

	return (
		<NavLink href={href} isActive={useNavLinkActive(href)} label={label} variant="admin_nav">
			{icon && <Icon name={icon} />}
		</NavLink>
	);
}

export function AdminSidebar(props: AdminSidebarProps) {
	const { sidebarOpen } = props;
	const pageProps = usePage<SharedProps>().props;
	const { format } = useTranslation({});
	const { user } = useAuth();

	const { menu } = useMenu();

	return (
		<aside className="sidebar" aria-expanded={sidebarOpen}>
			<Card>
				<div className="grid gap-3">
					<div className="flex items-center justify-between">
						{user && <Avatar username={user.username} showUsername />}
						<ThemeToggle />
					</div>
					<span>{format(new Date(), 'long', pageProps.locale as Lang)}</span>
				</div>
			</Card>
			<Card>
				<nav className="grid gap-1">
					{menu.map((group) => (
						<div key={`admin-category-${group.category}`}>
							{group.label && <Heading level={4}>{group.label}</Heading>}
							<ul className="grid gap-1 my-2">
								{group.entries.map((entry) => (
									<li key={`admin-category-${group.category}-${entry.label}`}>
										<CanAccess permission={entry.permission}>
											<AdminMenuEntry
												label={entry.label}
												route={entry.route}
												routeParams={entry.routeParams}
												icon={entry.icon}
											/>
										</CanAccess>
									</li>
								))}
							</ul>
						</div>
					))}
				</nav>
			</Card>
		</aside>
	);
}
