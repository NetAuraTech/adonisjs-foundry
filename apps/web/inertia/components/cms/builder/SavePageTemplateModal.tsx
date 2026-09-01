import { SharedProps } from '@adonisjs/inertia/types';
import { Button } from '@foundry/design-system/button';
import { Icon } from '@foundry/design-system/icon';
import { Input } from '@foundry/design-system/input';
import { Label } from '@foundry/design-system/label';
import { Modal } from '@foundry/design-system/modal';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { captureTemplateThumbnail } from '~/components/cms/utils/template_thumbnail';
import { useTranslation } from '~/hooks/use_translation';
import type { PageContent } from '#cms/types/page';
import type { PageEditorTranslations } from '#transport/cms/helpers/i18n_payloads/page_editor';

interface SavePageTemplateModalProps {
	pageId: number;
	locale: string;
	content: PageContent;
	handleClose: () => void;
	translations: PageEditorTranslations;
}

export default function SavePageTemplateModal({
	pageId,
	locale,
	content,
	handleClose,
	translations,
}: SavePageTemplateModalProps) {
	const { t } = useTranslation(translations);
	const [name, setName] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const { csrfToken } = usePage<SharedProps>().props;

	async function handleSave() {
		if (saving) return;
		if (!name.trim()) {
			setError(t('save_page_template.error'));
			return;
		}

		setSaving(true);
		setError(null);

		try {
			const res = await fetch('/api/v1/admin/templates/from-page', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					'X-CSRF-Token': csrfToken as string,
				},
				body: JSON.stringify({ name: name.trim(), pageId, locale, content }),
			});

			if (!res.ok) {
				const body = await res.json();
				throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
			}

			const { template } = await res.json();

			const { fileId } = await captureTemplateThumbnail({
				templateId: template.id,
				locale,
				csrfToken: csrfToken as string,
			});

			const updateRes = await fetch(`/api/v1/admin/templates/${template.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					'X-CSRF-Token': csrfToken as string,
				},
				body: JSON.stringify({ thumbnailId: fileId }),
			});

			if (!updateRes.ok) {
				throw new Error('Failed to save thumbnail');
			}

			handleClose();
		} catch (err: any) {
			setError(err?.message ?? 'Failed to save template');
		} finally {
			setSaving(false);
		}
	}

	return (
		<Modal handleClose={handleClose}>
			<div className="w-[420px] rounded-xl bg-canvas border border-edge shadow-2xl p-5">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-sm font-semibold text-ink">{t('save_page_template.title')}</h3>
					<button type="button" onClick={handleClose} className="text-ink-subtle hover:text-ink transition-colors">
						<Icon name="X" size={16} />
					</button>
				</div>

				<div className="grid gap-4">
					<div className="grid gap-1.5">
						<Label label={t('save_page_template.name_label')} htmlFor="save-page-template-name" />
						<Input
							name="save-page-template-name"
							type="text"
							defaultValue={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t('save_page_template.name_placeholder')}
						/>
						{error && <p className="text-xs text-danger">{error}</p>}
					</div>

					<p className="text-xs text-ink-subtle">{t('save_page_template.reminder')}</p>

					<div className="flex items-center justify-end gap-2">
						<Button type="button" variant="outline" fitContent disabled={saving} onClick={handleClose}>
							{t('save_block_template.cancel')}
						</Button>
						<Button type="button" fitContent loading={saving} onClick={handleSave}>
							{t('save_page_template.submit')}
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
