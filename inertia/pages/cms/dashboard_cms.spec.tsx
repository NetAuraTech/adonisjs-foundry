import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import DashboardPage from '~/pages/core/admin/dashboard';
import type { CmsDashboardTranslations } from '#cms/helpers/i18n_payloads/dashboard_cms';
import type { AdminDashboardTranslations } from '#helpers/i18n_payloads/dashboard';
import type { Data } from '@generated/data';
import type { ReactNode } from 'react';

/**
 * CMS dashboard section rendering: the page and template cards appear when
 * their keys are present in the payload and disappear when they are not.
 *
 * This spec lives in the CMS subtree (`inertia/pages/cms/`) so the `inertia`
 * flavor prunes it alongside the CMS card modules; the core dashboard spec
 * (`inertia/pages/core/admin/dashboard.spec.tsx`) keeps the auth/file
 * contract that every flavor shares.
 *
 * Inertia's server-provided context is substituted with narrow mocks; atoms,
 * guards and the translation hook run for real.
 */

const { mockPageProps } = vi.hoisted(() => ({
	mockPageProps: {
		props: {
			locale: 'en',
			currentUser: {
				permissions: ['pages.view', 'templates.view'],
				role: { slug: 'admin' },
			},
		},
	},
}));

vi.mock('@inertiajs/react', () => ({
	usePage: () => mockPageProps,
	Head: () => null,
}));

vi.mock('@adonisjs/inertia/react', () => ({
	Link: ({ children }: { children?: ReactNode }) => <a>{children}</a>,
}));

vi.mock('~/layouts/admin', () => ({
	default: ({ children }: { children?: ReactNode }) => children,
}));
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const translations: AdminDashboardTranslations & CmsDashboardTranslations = {
	title: 'Dashboard',
	cards: {
		users: 'Users',
		files: 'Files',
		folders: 'Folders',
		no_role: 'No role',
	},
	recent: {
		uploads: 'Recent uploads',
		empty: 'Nothing to display yet.',
	},
	view_all: 'View all',
	cms: {
		cards: {
			pages: 'Pages',
			translations: 'Page translations',
			templates: 'Templates',
			published_locales: 'Published locales',
		},
		status: { draft: 'Draft', published: 'Published', archived: 'Archived' },
		recent: {
			published_pages: 'Recently published',
		},
	},
};

const cmsStats: Data.Dashboard = {
	page: {
		pages: 3,
		pageTranslations: { draft: 1, published: 2, archived: 0, total: 3 },
		publishedLocales: 2,
		recentPublishedPages: [
			{
				id: 11,
				pageId: 1,
				title: 'Welcome',
				slug: 'welcome',
				locale: 'en',
				publishedAt: '2026-08-01T10:00:00.000Z',
			},
		],
	},
	template: { templates: 4 },
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(async () => {
	await act(async () => root.unmount());
	container.remove();
});

async function render(stats: Data.Dashboard): Promise<string> {
	await act(async () => {
		root.render(<DashboardPage stats={stats} translations={translations} />);
	});
	return container.textContent ?? '';
}

describe('DashboardPage — CMS sections', () => {
	it('renders the page and template sections when present', async () => {
		const content = await render(cmsStats);

		expect(content).toContain('Page translations: 3');
		expect(content).toContain('2 Published');
		expect(content).toContain('1 Draft');
		expect(content).toContain('0 Archived');
		expect(content).toContain('Published locales: 2');
		// Template count renders nested inside the page card when both exist.
		expect(content).toContain('Templates: 4');
		// Recent-activity list.
		expect(content).toContain('Recently published');
		expect(content).toContain('Welcome');
	});

	it('renders the template section without the page section', async () => {
		const { page: _page, ...templateOnlyStats } = cmsStats;
		const content = await render(templateOnlyStats);

		// The template section stands on its own card when the page one is absent.
		expect(content).toContain('Templates');
		expect(content).not.toContain('Page translations');
		expect(content).not.toContain('Recently published');
	});
});

/**
 * Permission-based hiding: the server ships every section's figures to any
 * admin, so the client hides a CMS card the current user may not see (via
 * `CanAccess`) even when its data is present in the payload.
 */
describe('DashboardPage — CMS sections | permission-based hiding', () => {
	function setPermissions(permissions: string[]) {
		mockPageProps.props.currentUser.permissions = permissions;
	}

	it('hides the nested template count when templates.view is missing', async () => {
		setPermissions(['pages.view']);
		const content = await render(cmsStats);

		// The page card (pages.view) still renders.
		expect(content).toContain('Page translations: 3');
		expect(content).toContain('Recently published');
		// The nested template figure (templates.view) is hidden.
		expect(content).not.toContain('Templates: 4');
	});

	it('hides the page and template cards when no CMS permission is held', async () => {
		setPermissions([]);
		const content = await render(cmsStats);

		expect(content).toContain('Dashboard');
		expect(content).not.toContain('Page translations');
		expect(content).not.toContain('Recently published');
		expect(content).not.toContain('Templates');
	});
});
