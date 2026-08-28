import { Form } from '@adonisjs/inertia/react';
import { SharedProps } from '@adonisjs/inertia/types';
import { AdminMain } from '@foundry/design-system/admin-main';
import { Button } from '@foundry/design-system/button';
import { Card } from '@foundry/design-system/card';
import { Field } from '@foundry/design-system/field';
import { Icon } from '@foundry/design-system/icon';
import { Paragraph } from '@foundry/design-system/paragraph';
import { SelectOption } from '@foundry/design-system/select';
import { Data } from '@generated/data';
import { router, usePage } from '@inertiajs/react';
import { ReactElement, useState } from 'react';
import { urlFor } from '~/client';
import { captureTemplateThumbnail } from '~/components/cms/utils/template_thumbnail';
import { CanAccess } from '~/guards/can_access';
import { sanitizeText } from '~/helpers/sanitization';
import { useMenu } from '~/hooks/use_admin';
import { Lang, useTranslation } from '~/hooks/use_translation';
import Layout from '~/layouts/admin';
import type { AdminTemplatesTranslations } from '#app/cms/helpers/i18n_payloads/templates_index';

interface TemplatesIndexPageProps {
	templates: Data.Cms.Template[];
	filters: {
		type?: string;
		block_type?: string;
		search?: string;
	};
	translations: AdminTemplatesTranslations;
}

export default function TemplatesIndexPage(props: TemplatesIndexPageProps) {
	const { templates, filters, translations } = props;
	const pageProps = usePage<SharedProps>().props;
	const { t, format } = useTranslation(translations);
	const { getEntryIcon } = useMenu();

	const [regeneratingId, setRegeneratingId] = useState<number | null>(null);

	async function handleRegenerate(template: Data.Cms.Template) {
		setRegeneratingId(template.id);
		try {
			const { fileId } = await captureTemplateThumbnail({
				templateId: template.id,
				locale: (pageProps.locale as string) ?? 'en',
				csrfToken: pageProps.csrfToken,
			});
			router.put(
				urlFor('admin.cms.templates.update', { id: template.id }),
				{ thumbnailId: fileId },
				{ preserveScroll: true },
			);
		} catch (error) {
			console.error('[TemplatesIndex] thumbnail regeneration failed', error);
		} finally {
			setRegeneratingId(null);
		}
	}

	return (
		<AdminMain
			title={t('title')}
			icon={getEntryIcon('admin.cms.templates.render')}
			action={
				<div className="max-w-xs text-right">
					<p className="text-xs font-medium text-ink">{t('create_guidance.value')}</p>
					<p className="text-xs text-ink-subtle mt-0.5">{t('create_guidance.from_page')}</p>
				</div>
			}
		>
			<Card
				header={
					<Form
						action={urlFor('admin.cms.templates.render')}
						method="get"
						className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
					>
						<Field
							type="text"
							name="search"
							label={t('search.value')}
							placeholder={t('search.placeholder')}
							defaultValue={filters.search}
							sanitizeValue={sanitizeText}
						/>
						<Field
							type="select"
							name="type"
							label={t('search.type.value')}
							placeholder={t('search.type.placeholder')}
							defaultValue={filters.type}
							sanitizeValue={sanitizeText}
						>
							<SelectOption label={t('search.type.page')} value="page" />
							<SelectOption label={t('search.type.block')} value="block" />
						</Field>
						<Button type="submit" fitContent>
							{t('search.filter')}
						</Button>
					</Form>
				}
			>
				{templates.length === 0 ? (
					<div className="text-center py-20 rounded-xl border border-dashed border-edge">
						<Paragraph variant="muted">{t('empty.value')}</Paragraph>
						<Paragraph variant="subtle">{t('empty.help')}</Paragraph>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{templates.map((template) => (
							<div
								key={template.id}
								className="rounded-xl border border-edge bg-canvas flex flex-col justify-between overflow-hidden"
							>
								<div className="flex-1 flex flex-col gap-3 p-4">
									<ThumbnailCanvas template={template} placeholder={t('thumbnail.placeholder')} />
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0">
											<p className="text-sm font-medium text-ink truncate">
												{t(template.name as any, { defaultValue: template.name })}
											</p>
											{template.description && (
												<p className="text-ink-muted mt-0.5 line-clamp-2">
													{t(template.description as any, { defaultValue: template.description })}
												</p>
											)}
										</div>
										<span
											className={`shrink-0 px-3 py-1 rounded-full border font-medium ${
												template.type === 'page'
													? 'bg-primary-light text-primary-deep border-primary-deep'
													: 'bg-secondary-light text-secondary-deep border-secondary-deep'
											}`}
										>
											{template.type === 'block' && template.blockType
												? t(template.blockType as any, { defaultValue: template.blockType })
												: t(template.type as any, { defaultValue: template.type })}
										</span>
									</div>
								</div>
								<div className="flex items-center justify-between px-4 py-3 border-t border-edge">
									<span className="text-ink-subtle">
										{format(new Date(template.createdAt!), 'medium', pageProps.locale as Lang)}
									</span>
									<div className="flex items-center gap-1">
										<CanAccess permission="templates.update">
											<Button
												variant="icon"
												fitContent
												disabled={regeneratingId === template.id}
												onClick={() => handleRegenerate(template)}
												title={t('actions.regenerate', { name: template.name })}
											>
												<Icon name={regeneratingId === template.id ? 'Loader' : 'RefreshCcw'} size={18} />
											</Button>
										</CanAccess>
										<CanAccess permission="templates.view">
											<Button
												variant="icon"
												href={urlFor('admin.cms.templates.edit', { id: template.id })}
												title={t('actions.edit', { name: template.name })}
												fitContent
											>
												<Icon name="Pen" size={18} />
											</Button>
										</CanAccess>
										<CanAccess permission="templates.delete">
											<Form
												action={urlFor('admin.cms.templates.destroy', { id: template.id })}
												method="delete"
												onBefore={() => {
													return window.confirm(t('delete.confirm'));
												}}
											>
												<Button
													variant="icon_danger"
													title={t('delete.value', {
														name: template.name,
													})}
													fitContent
												>
													<Icon name="Trash" size={18} />
												</Button>
											</Form>
										</CanAccess>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>
		</AdminMain>
	);
}

function ThumbnailCanvas({ template, placeholder }: { template: Data.Cms.Template; placeholder: string }) {
	if (!template.thumbnail?.url) {
		return (
			<div className="h-40 w-full rounded-lg border border-dashed border-edge bg-sunken flex flex-col items-center justify-center gap-1">
				<Icon name="Image" size={22} className="text-ink-subtle" />
				<span className="text-xs text-ink-subtle">{placeholder}</span>
			</div>
		);
	}
	return (
		<div className="h-40 w-full rounded-lg overflow-hidden border border-edge bg-sunken">
			<img src={template.thumbnail.url} alt={template.name} className="w-full h-full object-cover" />
		</div>
	);
}

TemplatesIndexPage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>;
