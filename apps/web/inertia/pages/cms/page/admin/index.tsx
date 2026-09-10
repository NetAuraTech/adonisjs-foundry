import { Form } from '@adonisjs/inertia/react';
import { SharedProps } from '@adonisjs/inertia/types';
import { AdminMain } from '@foundry/design-system/admin-main';
import { Button } from '@foundry/design-system/button';
import { Card } from '@foundry/design-system/card';
import { Field } from '@foundry/design-system/field';
import { Icon } from '@foundry/design-system/icon';
import { Pagination } from '@foundry/design-system/pagination';
import { SelectOption } from '@foundry/design-system/select';
import Table from '@foundry/design-system/table';
import { Data } from '@generated/data';
import { usePage } from '@inertiajs/react';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { actionFor, urlFor } from '~/client';
import { CanAccess } from '~/guards/can_access';
import { sanitizeText } from '~/helpers/sanitization';
import { useMenu } from '~/hooks/use_admin';
import { locales, useTranslation } from '~/hooks/use_translation';
import Layout from '~/layouts/admin';
import { Paginated } from '~/types/paginated';
import type { PageStatus } from '#cms/types/page';
import type { AdminPagesIndexTranslations } from '#transport/cms/helpers/i18n_payloads/pages_index';

interface Props {
	pages: Paginated<Data.Cms.Page>;
	filters: {
		status?: string;
		locale?: string;
		search?: string;
	};
	searchAvailable: boolean;
	translations: AdminPagesIndexTranslations;
}

const PAGE_STATUSES: PageStatus[] = ['draft', 'published', 'archived'];

const SEARCH_DEBOUNCE_MS = 300;

const statusesClass = {
	published: 'text-success border-success bg-success-soft',
	draft: 'text-secondary border-secondary bg-secondary-light/20',
	archived: 'text-warning border-warning bg-warning-soft',
} as const;

interface PageSearchResponse {
	available: boolean;
	results: { page: Data.Cms.Page; matchedLocales: string[] }[];
}

/**
 * One rendered row: the page plus (in live-search mode) the locales whose
 * translation matched the query. `matchedLocales` is `null` outside live mode.
 */
interface PageRow {
	page: Data.Cms.Page;
	matchedLocales: string[] | null;
}

async function fetchPageSearch(search: string, locale?: string, status?: string): Promise<PageSearchResponse | null> {
	const params = new URLSearchParams({ search });
	if (locale) params.set('locale', locale);
	if (status) params.set('status', status);

	const res = await fetch(`/api/v1/admin/pages/search?${params.toString()}`, {
		headers: { Accept: 'application/json' },
	});

	if (!res.ok) return null;

	const body = (await res.json()) as { data?: PageSearchResponse };
	return body.data ?? null;
}

export default function PagesIndexPage(props: Props) {
	const { pages, filters, searchAvailable, translations } = props;
	const pageProps = usePage<SharedProps>().props;
	const { t } = useTranslation(translations);
	const { t: commonT } = useTranslation(pageProps.common_translations);

	const { getEntryIcon } = useMenu();

	const [query, setQuery] = useState(filters.search ?? '');
	const [localeFilter, setLocaleFilter] = useState(filters.locale ?? '');
	const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
	const [live, setLive] = useState<PageSearchResponse | null>(null);
	const [searching, setSearching] = useState(false);

	// Live full-text search: debounce the query and hit the Typesense-backed
	// endpoint. A `null`/unavailable result falls back to the server-rendered
	// list, so a search outage never hides pages.
	useEffect(() => {
		if (!searchAvailable) return;

		const term = query.trim();
		if (!term) {
			setLive(null);
			setSearching(false);
			return;
		}

		setSearching(true);
		const handle = setTimeout(async () => {
			const result = await fetchPageSearch(term, localeFilter || undefined, statusFilter || undefined);
			setLive(result);
			setSearching(false);
		}, SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(handle);
	}, [query, localeFilter, statusFilter, searchAvailable]);

	const rows: PageRow[] = useMemo(() => {
		if (searchAvailable && live && live.available) {
			return live.results.map((result) => ({ page: result.page, matchedLocales: result.matchedLocales }));
		}
		return pages.data.map((page) => ({ page, matchedLocales: null }));
	}, [searchAvailable, live, pages.data]);

	const inLiveMode = Boolean(searchAvailable && live && live.available);

	return (
		<>
			<AdminMain
				title={t('title')}
				icon={getEntryIcon('admin.cms.pages.render')}
				action={
					<CanAccess permission="pages.create">
						<Button href={urlFor('admin.cms.pages_create.render')} variant="secondary" fitContent>
							{t('action')}
						</Button>
					</CanAccess>
				}
			>
				<Card
					header={
						<Form
							action={actionFor('admin.cms.pages.render')}
							className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
						>
							<Field
								type="text"
								name="search"
								label={t('search.value')}
								placeholder={t('search.placeholder')}
								defaultValue={filters.search}
								onChange={(event) => setQuery(event.target.value)}
								sanitizeValue={sanitizeText}
								helpText={searchAvailable && searching ? t('search.loading') : undefined}
							/>
							<Field
								type="select"
								label={t(`locale.value`)}
								name="locale"
								placeholder={t(`locale.all`)}
								defaultValue={filters.locale}
								onChange={(event) => setLocaleFilter(event.target.value)}
							>
								{locales.map((l) => (
									<SelectOption key={l} value={l} label={l.toUpperCase()} />
								))}
							</Field>
							<Field
								type="select"
								label={t(`status.value`)}
								name="status"
								placeholder={t(`status.all`)}
								defaultValue={filters.status}
								onChange={(event) => setStatusFilter(event.target.value)}
							>
								{PAGE_STATUSES.map((status) => (
									<SelectOption key={`status-${status}`} value={status} label={t(`status.${status}`)} />
								))}
							</Field>
							<Button type="submit" fitContent>
								{t('search.filter')}
							</Button>
						</Form>
					}
					footer={
						<Pagination
							buildHref={(page) =>
								urlFor('admin.cms.pages.render', undefined, {
									qs: {
										search: query || undefined,
										locale: localeFilter || undefined,
										status: statusFilter || undefined,
										page,
									},
								})
							}
							filters={{ search: query, locale: localeFilter, status: statusFilter }}
							metadata={pages.metadata}
							summaryText={(start, end, total) => commonT('pagination.showing', { start, end, total })}
							previousTitle={commonT('pagination.previous')}
							nextTitle={commonT('pagination.next')}
						/>
					}
				>
					<Table>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell>{t('page_title')}</Table.HeaderCell>
								<Table.HeaderCell>{t(`slug`)}</Table.HeaderCell>
								<Table.HeaderCell>{t(`status.value`)}</Table.HeaderCell>
								<Table.HeaderCell>{t(`locale.value`)}</Table.HeaderCell>
								<Table.HeaderCell>{t('actions.value')}</Table.HeaderCell>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{inLiveMode && searching ? (
								<Table.Row>
									<Table.Cell colSpan={5} className="text-center! p-12!">
										{t('search.loading')}
									</Table.Cell>
								</Table.Row>
							) : rows.length === 0 ? (
								<Table.Row>
									<Table.Cell colSpan={5} className="text-center! p-12!">
										{inLiveMode ? t('search.empty') : t('empty')}
									</Table.Cell>
								</Table.Row>
							) : (
								rows.map(({ page, matchedLocales }) => {
									const primary =
										page.translations.find((tr) => tr.locale === page.defaultLocale) ?? page.translations[0];

									return (
										<Table.Row key={`page-${page.id}`}>
											<Table.Cell data-label={t('value', { count: 1 })}>{primary?.title ?? '—'}</Table.Cell>
											<Table.Cell data-label={t(`slug`)}>
												<code>/{primary?.slug ?? '—'}</code>
											</Table.Cell>
											<Table.Cell data-label={t(`status.value`)}>
												{primary && (
													<span className={`px-4 py-1 border rounded ${statusesClass[primary.status]}`}>
														{t(`status.${primary.status}` as any)}
													</span>
												)}
											</Table.Cell>
											<Table.Cell data-label={t(`locale.value`)}>
												<div className="flex gap-1 flex-wrap">
													{page.translations.map((tr) => {
														const matched = matchedLocales?.includes(tr.locale);
														return (
															<span
																key={tr.locale}
																className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-sunken text-ink-muted border uppercase ${
																	matched ? 'border-success text-success' : 'border-edge'
																}`}
															>
																{tr.locale}
																<span
																	className={`w-1.5 h-1.5 rounded-full ${tr.status === 'published' ? 'bg-success' : 'bg-edge-strong'}`}
																/>
															</span>
														);
													})}
												</div>
											</Table.Cell>
											<Table.Cell data-label={t('actions.value')}>
												<div className="flex items-center w-full py-4 gap-2">
													<CanAccess permission="pages.view">
														<Button
															variant="icon_info"
															href={urlFor('admin.cms.pages_show.render', { id: page.id })}
															title={t('actions.show', { title: primary?.title ?? '—' })}
															fitContent
														>
															<Icon name="Eye" size={18} />
														</Button>
													</CanAccess>
													<CanAccess permission="pages.update">
														<Button
															variant="icon_warning"
															href={urlFor('admin.cms.pages_update.render', { id: page.id })}
															title={t('actions.edit', { title: primary?.title ?? '—' })}
															fitContent
														>
															<Icon name="Pen" size={18} />
														</Button>
													</CanAccess>
													<CanAccess permission="pages.delete">
														<Form
															action={actionFor('admin.cms.pages.destroy', { id: page.id })}
															onBefore={() => {
																return window.confirm(t('actions.delete.confirm'));
															}}
														>
															<Button
																variant="icon_danger"
																title={t('actions.delete.value', {
																	title: primary?.title ?? `Page #${page.id}`,
																})}
																fitContent
															>
																<Icon name="Trash" size={18} />
															</Button>
														</Form>
													</CanAccess>
												</div>
											</Table.Cell>
										</Table.Row>
									);
								})
							)}
						</Table.Body>
					</Table>
				</Card>
			</AdminMain>
		</>
	);
}

PagesIndexPage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>;
