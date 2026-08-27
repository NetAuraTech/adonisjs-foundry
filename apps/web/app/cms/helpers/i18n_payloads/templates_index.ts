import { createI18nEntry } from '#services/i18n_service';
import type { BuildPayloadResult, I18nService } from '#services/i18n_service';

/**
 * The flat i18n key mapping for the admin templates listing page.
 */
export const TEMPLATES_INDEX_MAPPING = {
	title: 'cms.template.admin.list.title',
	actions: {
		edit: createI18nEntry('cms.template.admin.list.actions.edit', { name: '{name}' }),
		regenerate: createI18nEntry('cms.template.admin.list.actions.regenerate', { name: '{name}' }),
	},
	create_guidance: {
		value: 'cms.template.admin.list.create_guidance.value',
		from_page: 'cms.template.admin.list.create_guidance.from_page',
	},
	empty: {
		value: 'cms.template.admin.list.empty.value',
		help: 'cms.template.admin.list.empty.help',
	},
	thumbnail: {
		placeholder: 'cms.template.admin.list.thumbnail.placeholder',
	},
	search: {
		value: 'cms.template.admin.search.value',
		placeholder: 'cms.template.admin.search.placeholder',
		type: {
			value: 'cms.template.admin.search.type.value',
			placeholder: 'cms.template.admin.search.type.placeholder',
			page: 'cms.template.admin.search.type.page',
			block: 'cms.template.admin.search.type.block',
		},
		filter: 'cms.template.admin.search.filter',
	},
	delete: {
		value: createI18nEntry('cms.template.admin.delete.title', { name: '{name}' }),
		confirm: 'cms.template.admin.delete.confirm',
	},
};

/**
 * Shape of the resolved translation payload for the templates listing page.
 */
export type AdminTemplatesTranslations = BuildPayloadResult<typeof TEMPLATES_INDEX_MAPPING>;

/**
 * Builds the translation payload for the admin templates listing page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The templates listing `t` object with every UI string resolved.
 */
export function buildTemplatesIndexPayload(i18n: I18nService): AdminTemplatesTranslations {
	return i18n.buildPayload(TEMPLATES_INDEX_MAPPING);
}
