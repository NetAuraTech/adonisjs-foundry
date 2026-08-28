import { NavLink } from '@foundry/design-system/nav-link';
import { usePage } from '@inertiajs/react';
import { useMemo, MouseEvent } from 'react';
import { useTranslation } from '~/hooks/use_translation';
import { MetaData } from '~/types/paginated';
import type { SharedProps } from '@adonisjs/inertia/types';

interface PaginationProps {
	/** Pagination metadata returned by the server (current page, last page, total, etc.). */
	metadata: MetaData;
	/**
	 * Builds the resolved URL of a given page number. The caller builds it
	 * (e.g. with a typed `urlFor()`, merging the active `filters` into the
	 * query string) — the component never resolves routes.
	 *
	 * Omit it for client-side-only paging (no route navigation): pass
	 * `onClick` instead and every page link resolves to a no-op `#` href that
	 * `onClick` intercepts.
	 */
	buildHref?: (page: number) => string;
	/**
	 * Maximum number of page buttons to show in the middle window before
	 * collapsing into ellipses. Defaults to `5`.
	 */
	showPages?: number;
	/**
	 * Active filter key/value pairs forwarded to `onClick`. Ensures that
	 * navigating between pages preserves the current search and filter state.
	 */
	filters?: {
		[key: string]: string | number;
	};
	onClick?: (value: any) => void;
}

type PageItem = number | '...';

/**
 * Accessible pagination control.
 *
 * Renders a results summary (e.g. "Showing 1 to 20 of 84 results") and a
 * row of page navigation links. The page window is computed with
 * `useMemo` and collapses distant pages into `…` ellipses, always keeping
 * page 1 and the last page visible.
 *
 * All page links are built as `<NavLink variant="pagination">` with the
 * `page` query-string parameter merged alongside any active `filters`, so
 * search and filter state is preserved across pages.
 *
 * The previous (`«`) and next (`»`) arrows are disabled when already at the
 * first or last page respectively.
 *
 * Label strings ("Showing", "Previous", "Next") are read from the
 * `pagination` i18n namespace and adapt to the current locale automatically.
 *
 * @example
 * <Pagination
 *   buildHref={(page) => urlFor('admin.identity.users.render', undefined, { qs: { search: 'alice', page } })}
 *   metadata={users.metadata}
 *   filters={{ search: 'alice' }}
 * />
 */
export function Pagination(props: PaginationProps) {
	const { metadata, showPages = 5, filters, onClick, buildHref } = props;
	const pageProps = usePage<SharedProps>().props;
	const hrefFor = (page: number) => (buildHref ? buildHref(page) : '#');

	const { lastPage, perPage, currentPage, total } = metadata;
	const { t } = useTranslation(pageProps.common_translations);

	const start = (currentPage - 1) * perPage + 1;
	const end = Math.min(currentPage * perPage, total);

	const pages = useMemo<PageItem[]>(() => {
		if (lastPage <= showPages + 2) {
			return Array.from({ length: lastPage }, (_, i) => i + 1);
		}

		let s = Math.max(2, currentPage - 1);
		let e = Math.min(lastPage - 1, currentPage + 1);

		if (currentPage <= 3) e = Math.min(4, lastPage - 1);
		if (currentPage >= lastPage - 2) s = Math.max(lastPage - 3, 2);

		const middle: PageItem[] = [];
		if (s > 2) middle.push('...');
		for (let i = s; i <= e; i++) middle.push(i);
		if (e < lastPage - 1) middle.push('...');

		return [1, ...middle, lastPage];
	}, [currentPage, lastPage, showPages]);

	const handleClick = (e: MouseEvent, page: number) => {
		e.preventDefault();

		if (onClick) {
			onClick({ ...filters, page });
		}
	};

	return (
		<div className="flex flex-wrap items-center justify-between gap-4 px-1">
			<p className="text-sm text-ink-muted tabular-nums">{t('pagination.showing', { start, end, total })}</p>

			<nav aria-label="Pagination" className="flex items-center gap-1">
				{currentPage > 1 ? (
					<NavLink
						variant="pagination"
						label="«"
						href={hrefFor(currentPage - 1)}
						title={t('pagination.previous')}
						onClick={(e: MouseEvent) => handleClick(e, currentPage - 1)}
					/>
				) : (
					<NavLink
						variant="pagination"
						label="«"
						href={hrefFor(currentPage - 1)}
						title={t('pagination.previous')}
						disabled
						onClick={(e: MouseEvent) => handleClick(e, currentPage - 1)}
					/>
				)}
				{pages.map((page, index) =>
					page === '...' ? (
						<span
							key={`ellipsis-${index}`}
							className="grid size-8 place-items-center text-sm text-ink-muted select-none"
						>
							…
						</span>
					) : (
						<NavLink
							key={`page-${page}`}
							variant="pagination"
							label={`${page}`}
							href={hrefFor(page)}
							onClick={onClick ? (e: MouseEvent) => handleClick(e, page) : undefined}
							isActive={currentPage === page}
						/>
					),
				)}
				{currentPage < lastPage ? (
					<NavLink
						variant="pagination"
						label="»"
						href={hrefFor(currentPage + 1)}
						title={t('pagination.next')}
						onClick={(e: MouseEvent) => handleClick(e, currentPage + 1)}
					/>
				) : (
					<NavLink
						variant="pagination"
						label="»"
						href={hrefFor(currentPage + 1)}
						title={t('pagination.next')}
						disabled
						onClick={(e: MouseEvent) => handleClick(e, currentPage + 1)}
					/>
				)}
			</nav>
		</div>
	);
}
