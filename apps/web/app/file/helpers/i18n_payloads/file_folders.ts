import { createI18nEntry, type BuildPayloadResult, type I18nTranslator } from '#core/contracts/i18n_translator';

/**
 * The flat i18n key mapping for the admin folders management page.
 */
export const FILE_FOLDERS_MAPPING = {
	title: 'admin.folders.list.title',
	action: 'admin.files.list.title',
	browse: 'admin.folders.list.browse',
	help: 'admin.folders.form.help',
	name: {
		root: 'admin.folders.form.name.root',
		sub: 'admin.folders.form.name.sub',
	},
	empty: {
		value: 'admin.folders.list.empty.value',
		help: 'admin.folders.list.empty.help',
	},
	actions: {
		add: 'admin.folders.list.add',
		create: 'admin.folders.form.create',
		update: 'admin.folders.form.update',
		cancel: 'admin.folders.form.cancel',
		rename: 'admin.folders.list.rename',
		delete: {
			value: createI18nEntry('admin.folders.delete.title', { folder: '{folder}' }),
			confirm: 'admin.folders.delete.confirm',
		},
	},
};

/**
 * Shape of the resolved translation payload for the admin folders management page.
 */
export type AdminFileFoldersTranslations = BuildPayloadResult<typeof FILE_FOLDERS_MAPPING>;

/**
 * Builds the resolved translation payload for the admin folders management page.
 *
 * @param i18n - The request-scoped {@link I18nTranslator}.
 * @returns The folders management `t` object with every UI string resolved.
 */
export function buildFileFoldersPayload(i18n: I18nTranslator): AdminFileFoldersTranslations {
	return i18n.buildPayload(FILE_FOLDERS_MAPPING);
}
