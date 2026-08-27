import { Form } from '@adonisjs/inertia/react';
import { SharedProps } from '@adonisjs/inertia/types';
import { Data } from '@generated/data';
import { usePage } from '@inertiajs/react';
import { ReactElement, useState } from 'react';
import { Button } from '~/components/atoms/button';
import { Card } from '~/components/atoms/card';
import { Icon } from '~/components/atoms/icon';
import { Label } from '~/components/atoms/label';
import { captureTemplateThumbnail } from '~/components/cms/utils/template_thumbnail';
import { Field } from '~/components/molecules/field';
import { ImagePicker } from '~/components/molecules/image_picker';
import { AdminMain } from '~/components/organisms/admin/admin_main';
import { CanAccess } from '~/guards/can_access';
import { useMenu } from '~/hooks/use_admin';
import { useTranslation } from '~/hooks/use_translation';
import Layout from '~/layouts/admin';
import type { AdminTemplatesEditTranslations } from '#app/cms/helpers/i18n_payloads/templates_edit';
import type { Block, PageContent } from '#cms/types/page';

interface PageProps {
	template: Data.Cms.Template;
	translations: AdminTemplatesEditTranslations;
}

/**
 * Admin Template metadata page (rename, description, thumbnail) with a
 * read-only preview of the stored content.
 *
 * Template content itself is never edited here — a Block Template's content is
 * re-captured from the builder via "Save as template" with overwrite, per spec.
 */
export default function TemplatesEditPage({ template, translations }: PageProps) {
	const { t } = useTranslation(translations);
	const { getEntryIcon } = useMenu();
	const pageProps = usePage<SharedProps>().props;

	const [thumbnailId, setThumbnailId] = useState<number | null>(template.thumbnail?.id ?? null);
	const [regenerating, setRegenerating] = useState(false);

	async function handleRegenerate() {
		setRegenerating(true);
		try {
			const { fileId } = await captureTemplateThumbnail({
				templateId: template.id,
				locale: (pageProps.locale as string) ?? 'en',
				csrfToken: pageProps.csrfToken,
			});
			setThumbnailId(fileId);
		} catch (error) {
			console.error('[TemplatesEdit] thumbnail regeneration failed', error);
		} finally {
			setRegenerating(false);
		}
	}

	return (
		<AdminMain title={t('title', { name: template.name })} icon={getEntryIcon('admin.cms.templates.render')}>
			<Card
				header={
					<div className="flex items-center justify-between gap-3">
						<CanAccess permission="templates.view">
							<Button variant="icon" route="admin.cms.templates.render" title={t('back')} fitContent>
								<Icon name="ArrowLeft" />
							</Button>
						</CanAccess>
					</div>
				}
			>
				<Form route="admin.cms.templates.update" routeParams={{ id: template.id }}>
					{({ processing }) => (
						<div className="grid gap-6">
							<Field label={t('form.name')} name="name" type="text" defaultValue={template.name} required sanitize />
							<Field
								label={t('form.description')}
								name="description"
								type="textarea"
								defaultValue={template.description ?? ''}
								rows={4}
								sanitize
							/>

							<div className="grid gap-1.5">
								<Label label={t('form.thumbnail.value')} htmlFor="thumbnailId" />
								<ImagePicker
									key={thumbnailId ?? 'empty'}
									name="thumbnailId"
									defaultValue={thumbnailId ?? ''}
									onChange={(event) => setThumbnailId(event.target.value ? Number(event.target.value) : null)}
								/>
								<div className="flex items-center gap-2 mt-1">
									<Button type="button" variant="outline" fitContent disabled={regenerating} onClick={handleRegenerate}>
										<Icon name={regenerating ? 'Loader' : 'RefreshCcw'} size={16} />
										{regenerating ? t('form.thumbnail.regenerating') : t('form.thumbnail.regenerate')}
									</Button>
									<Button
										type="button"
										variant="icon_danger"
										fitContent
										disabled={!thumbnailId}
										onClick={() => setThumbnailId(null)}
										title={t('form.thumbnail.remove')}
									>
										<Icon name="Trash" size={16} />
									</Button>
								</div>
								<p className="text-xs text-ink-subtle">{t('form.thumbnail.placeholder')}</p>
							</div>

							<div className="flex items-center gap-2">
								<Button type="submit" loading={processing} fitContent>
									{t('form.submit')}
								</Button>
								<Button variant="outline" route="admin.cms.templates.render" fitContent>
									{t('form.cancel')}
								</Button>
							</div>
						</div>
					)}
				</Form>
			</Card>

			<Card title={t('preview.value')}>
				<div className="flex items-center gap-2 mb-3">
					<span
						className={`px-3 py-1 rounded-full border font-medium ${
							template.type === 'page'
								? 'bg-primary-light text-primary-deep border-primary-deep'
								: 'bg-secondary-light text-secondary-deep border-secondary-deep'
						}`}
					>
						{template.type === 'page' ? t('preview.page') : t('preview.block')}
					</span>
				</div>
				<TemplateContentPreview content={template.content as PageContent} emptyLabel={t('preview.empty')} />
			</Card>
		</AdminMain>
	);
}

function TemplateContentPreview({ content, emptyLabel }: { content: PageContent; emptyLabel: string }) {
	if (!content?.blocks?.length) {
		return <p className="text-sm text-ink-muted">{emptyLabel}</p>;
	}

	return (
		<div className="text-sm">
			{content.blocks.map((block) => (
				<BlockPreview key={block.id} block={block} depth={0} />
			))}
		</div>
	);
}

function BlockPreview({ block, depth }: { block: Block; depth: number }) {
	const hasChildren = (block.children?.length ?? 0) > 0;

	return (
		<div className={depth > 0 ? 'ml-4 pl-2 border-l border-edge/50' : ''}>
			<div className="flex items-center gap-2 py-1">
				<span className="text-xs font-medium text-primary-mid">{block.type}</span>
				<span className="text-xs text-ink-subtle truncate">{summarizeProps(block)}</span>
			</div>
			{hasChildren && block.children!.map((child) => <BlockPreview key={child.id} block={child} depth={depth + 1} />)}
		</div>
	);
}

function summarizeProps(block: Block): string {
	const props = block.props as Record<string, any>;
	if (block.type === 'title' && props.text) return String(props.text).slice(0, 40);
	if (block.type === 'paragraph' && props.text) return String(props.text).slice(0, 40);
	if (block.type === 'button' && props.label) return String(props.label).slice(0, 40);
	return '';
}

TemplatesEditPage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>;
