import { Data } from '@generated/data';
import { useEffect, useState } from 'react';
import { Button } from '~/components/atoms/button';
import { Icon } from '~/components/atoms/icon';
import { Input } from '~/components/atoms/input';
import { Label } from '~/components/atoms/label';
import { Modal } from '~/components/atoms/modal';
import { captureTemplateThumbnail } from '~/components/cms/utils/template_thumbnail';
import type { Block, BlockType } from '#cms/types/page';

interface SaveBlockTemplateModalProps {
	block: Block;
	blockType: BlockType;
	csrfToken: string;
	locale?: string;
	handleClose: () => void;
	onSaved?: () => void;
}

/**
 * Modal for saving a selected block as a Block Template.
 *
 * Submits to `POST /api/v1/admin/templates` (create or overwrite) and then
 * automatically triggers thumbnail capture + upload so a freshly-created
 * Template has a preview image immediately.
 */
export default function SaveBlockTemplateModal({
	block,
	blockType,
	csrfToken,
	locale = 'en',
	handleClose,
	onSaved,
}: SaveBlockTemplateModalProps) {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [overwriteId, setOverwriteId] = useState<number | null>(null);
	const [existingTemplates, setExistingTemplates] = useState<Data.Template.Template[]>([]);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchBlockTemplates() {
			try {
				const res = await fetch('/api/v1/admin/templates?type=block', {
					headers: { Accept: 'application/json' },
				});
				if (!res.ok) return;
				const json = await res.json();
				setExistingTemplates(json.templates ?? []);
			} catch {
				// silently fail; overwrite list is optional
			}
		}
		fetchBlockTemplates();
	}, []);

	async function handleSave() {
		if (!name.trim()) {
			setError('Name is required');
			return;
		}

		setSaving(true);
		setError(null);

		try {
			const res = await fetch('/api/v1/admin/templates', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					'X-CSRF-Token': csrfToken,
				},
				body: JSON.stringify({
					name: name.trim(),
					description: description.trim() || null,
					blockType,
					content: { blocks: [block] },
					overwriteId,
				}),
			});

			if (!res.ok) {
				const body = await res.json();
				throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
			}

			const { template } = await res.json();

			const { fileId } = await captureTemplateThumbnail({
				templateId: template.id,
				locale,
				csrfToken,
			});

			const updateRes = await fetch(`/api/v1/admin/templates/${template.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					'X-CSRF-Token': csrfToken,
				},
				body: JSON.stringify({ thumbnailId: fileId }),
			});

			if (!updateRes.ok) {
				throw new Error('Failed to save thumbnail');
			}

			onSaved?.();
			handleClose();
		} catch (err: any) {
			setError(err.message ?? 'An unexpected error occurred');
		} finally {
			setSaving(false);
		}
	}

	return (
		<Modal handleClose={handleClose}>
			<div className="w-[400px] rounded-xl bg-canvas border border-edge shadow-2xl p-4 space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-ink">Save as Template</h3>
					<button type="button" onClick={handleClose} className="text-ink-subtle hover:text-ink transition-colors">
						<Icon name="X" size={16} />
					</button>
				</div>

				<div className="space-y-3">
					<div className="grid gap-1.5">
						<Label label="Name" htmlFor="save-template-name" required />
						<Input
							name="save-template-name"
							type="text"
							defaultValue={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Card with gradient"
						/>
					</div>

					<div className="grid gap-1.5">
						<Label label="Description (optional)" htmlFor="save-template-desc" />
						<textarea
							id="save-template-desc"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="A brief description of this template"
							rows={3}
							className="w-full rounded-lg border border-edge bg-canvas px-3 py-2 text-sm placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-primary-mid"
						/>
					</div>

					{existingTemplates.length > 0 && (
						<div className="grid gap-1.5">
							<Label label="Overwrite existing" htmlFor="save-template-overwrite" />
							<select
								id="save-template-overwrite"
								value={overwriteId ?? ''}
								onChange={(e) => setOverwriteId(e.target.value ? Number(e.target.value) : null)}
								className="w-full rounded-lg border border-edge bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-mid"
							>
								<option value="">— Save as new —</option>
								{existingTemplates.map((tpl) => (
									<option key={tpl.id} value={tpl.id}>
										{tpl.name}
									</option>
								))}
							</select>
						</div>
					)}

					{error && <p className="text-xs text-danger">{error}</p>}
				</div>

				<div className="flex items-center justify-end gap-2">
					<Button variant="outline" onClick={handleClose} fitContent disabled={saving}>
						Cancel
					</Button>
					<Button onClick={handleSave} loading={saving} fitContent>
						Save Template
					</Button>
				</div>
			</div>
		</Modal>
	);
}
