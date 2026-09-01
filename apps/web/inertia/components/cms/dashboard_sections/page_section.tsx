import { Link } from '@adonisjs/inertia/react';
import { Paragraph } from '@foundry/design-system/paragraph';
import { urlFor } from '~/client';
import { RecentCard } from '~/components/dashboard_sections/recent_card';
import { StatCard } from '~/components/dashboard_sections/stat_card';
import { CanAccess } from '~/guards/can_access';
import { useTranslation } from '~/hooks/use_translation';
import { registerDashboardSection, type DashboardSectionCardProps } from '~/lib/dashboard_sections';
import type { CmsDashboardTranslations } from '#transport/cms/helpers/i18n_payloads/dashboard_cms';
import type { AdminDashboardTranslations } from '#transport/core/helpers/i18n_payloads/dashboard';
import type { Data } from '@generated/data';

type CmsTranslations = AdminDashboardTranslations & CmsDashboardTranslations;

/**
 * Page dashboard section cards: page/translation counts, the status breakdown
 * and the recently-published activity list.
 *
 * Registered into the client-side section registry at module load. This module
 * lives in the CMS subtree (`inertia/components/cms/`), so the `inertia`
 * flavor prunes it entirely and the dashboard simply never renders a page
 * section.
 */
function PageStatCard({ stats, translations }: DashboardSectionCardProps) {
	const { t } = useTranslation(translations as CmsTranslations);
	const page: Data.Core.Dashboard['page'] = stats.page;
	const template: Data.Core.Dashboard['template'] = stats.template;

	if (!page) return null;

	return (
		<CanAccess permission="pages.view">
			<StatCard
				icon="PanelsTopLeft"
				label={t('cms.cards.pages')}
				value={page.pages}
				href={urlFor('admin.cms.pages.render')}
			>
				<Paragraph variant="muted" spacing="sm">
					{`${t('cms.cards.translations')}: ${page.pageTranslations.total}`}
				</Paragraph>
				<div className="mt-2 flex flex-wrap gap-2 text-sm">
					<span className="text-success">{`${page.pageTranslations.published} ${t('cms.status.published')}`}</span>
					<span className="text-secondary">{`${page.pageTranslations.draft} ${t('cms.status.draft')}`}</span>
					<span className="text-warning">{`${page.pageTranslations.archived} ${t('cms.status.archived')}`}</span>
				</div>
				<Paragraph variant="muted" spacing="sm">
					{`${t('cms.cards.published_locales')}: ${page.publishedLocales}`}
				</Paragraph>
				{template && (
					<CanAccess permission="templates.view">
						<Paragraph variant="muted" spacing="sm">
							{`${t('cms.cards.templates')}: ${template.templates}`}
						</Paragraph>
					</CanAccess>
				)}
			</StatCard>
		</CanAccess>
	);
}

function PageRecentCard({ stats, translations, formatDate }: DashboardSectionCardProps) {
	const { t } = useTranslation(translations as CmsTranslations);
	const page: Data.Core.Dashboard['page'] = stats.page;

	if (!page) return null;

	return (
		<CanAccess permission="pages.view">
			<RecentCard
				title={t('cms.recent.published_pages')}
				viewAllHref={urlFor('admin.cms.pages.render')}
				viewAllLabel={t('view_all')}
			>
				{page.recentPublishedPages.length === 0 ? (
					<Paragraph variant="muted" spacing="xs" className="p-6">
						{t('recent.empty')}
					</Paragraph>
				) : (
					<ul className="divide-y divide-edge">
						{page.recentPublishedPages.map((entry) => (
							<li key={entry.id}>
								<Link
									href={urlFor('admin.cms.pages_show.render', { id: entry.pageId })}
									className="flex items-center justify-between gap-2 px-6 py-3 hover:bg-sunken"
								>
									<span className="truncate">
										{entry.title} <span className="text-ink-subtle">({entry.locale})</span>
									</span>
									<span className="shrink-0 text-sm text-ink-muted">{formatDate(entry.publishedAt)}</span>
								</Link>
							</li>
						))}
					</ul>
				)}
			</RecentCard>
		</CanAccess>
	);
}

registerDashboardSection('page', { Stat: PageStatCard, Recent: PageRecentCard });
