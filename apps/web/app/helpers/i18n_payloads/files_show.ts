import { createI18nEntry, type BuildPayloadResult, type I18nService } from '#services/i18n_service';

/**
 * The flat i18n key mapping for the admin file detail page, including the
 * alt-text editor.
 */
export const FILES_SHOW_MAPPING = {
	title: createI18nEntry('admin.files.show.title', { name: '{name}' }),
	actions: {
		back: 'admin.files.list.title',
		delete: {
			value: createI18nEntry('admin.files.delete.title', { name: '{name}' }),
			confirm: 'admin.files.delete.confirm',
		},
	},
	info: {
		name: 'admin.files.show.info.name',
		type: 'admin.files.show.info.type',
		size: 'admin.files.show.info.size',
		uploaded_at: 'admin.files.show.info.uploaded_at',
		value: 'admin.files.show.info.value',
	},
	alts: {
		value: 'admin.files.show.alts.value',
		add: 'admin.files.show.alts.add',
		delete: {
			confirm: 'admin.files.show.alts.delete.confirm',
		},
		form: {
			update: 'admin.files.show.alts.form.update',
			submit: 'admin.files.show.alts.form.submit',
			cancel: 'admin.files.show.alts.form.cancel',
			locale: {
				value: 'admin.files.show.alts.form.locale.value',
			},
			key: {
				value: 'admin.files.show.alts.form.key.value',
				placeholder: 'admin.files.show.alts.form.key.placeholder',
			},
			alt_text: {
				value: 'admin.files.show.alts.form.alt_text.value',
				placeholder: 'admin.files.show.alts.form.alt_text.placeholder',
			},
		},
	},
};

/**
 * Shape of the resolved translation payload for the admin file detail page.
 */
export type AdminFilesShowTranslations = BuildPayloadResult<typeof FILES_SHOW_MAPPING>;

/**
 * Builds the resolved translation payload for the admin file detail page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The file detail `t` object with every UI string resolved.
 */
export function buildFilesShowPayload(i18n: I18nService): AdminFilesShowTranslations {
	return i18n.buildPayload(FILES_SHOW_MAPPING);
}
