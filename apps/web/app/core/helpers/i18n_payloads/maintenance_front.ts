import type { BuildPayloadResult, I18nService } from '#services/i18n_service';

/**
 * The flat i18n key mapping for the front-facing maintenance page shown to
 * visitors while the application is down.
 */
export const MAINTENANCE_MAPPING = {
	title: 'maintenance.title',
	default_message: 'maintenance.default_message',
	retry_in: 'maintenance.retry_in',
	retry_now: 'maintenance.retry_now',
};

/**
 * Shape of the resolved translation payload for the front-facing maintenance page.
 */
export type MaintenanceTranslations = BuildPayloadResult<typeof MAINTENANCE_MAPPING>;

/**
 * Builds the resolved translation payload for the front-facing maintenance page.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The maintenance page `t` object with every UI string resolved.
 */
export function buildMaintenanceIndexPayload(i18n: I18nService): MaintenanceTranslations {
	return i18n.buildPayload(MAINTENANCE_MAPPING);
}
