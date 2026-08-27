import type { PageStatus } from '#cms/types/page';
import type { DateTime } from 'luxon';

/** A recently published page translation entry for the dashboard activity list. */
export interface DashboardRecentPage {
	id: number;
	pageId: number;
	title: string;
	slug: string;
	locale: string;
	publishedAt: DateTime | null;
}

/** Dashboard section contributed by the page domain. */
export interface DashboardPageSection {
	pages: number;
	/** Page translations grouped by publication status, plus the grand total. */
	pageTranslations: Record<PageStatus, number> & { total: number };
	/** Number of unique locales having at least one published page translation. */
	publishedLocales: number;
	recentPublishedPages: DashboardRecentPage[];
}

/** Dashboard section contributed by the template domain. */
export interface DashboardTemplateSection {
	templates: number;
}

/**
 * Extends the flavor-agnostic {@link DashboardStats} with the CMS sections.
 *
 * This augmentation lives inside the CMS module subtree, so pruning the CMS
 * (the `inertia` and `api` flavors) simply removes these keys from
 * `DashboardStats` — no import of `#core/types/dashboard` can break a flavor build.
 * On `main`, the keys are fully type-safe.
 */
declare module '#core/types/dashboard' {
	interface DashboardStats {
		page?: DashboardPageSection;
		template?: DashboardTemplateSection;
	}
}
