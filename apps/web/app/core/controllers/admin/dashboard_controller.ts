import { inject } from '@adonisjs/core';
import { buildDashboardPayload } from '#app/core/helpers/i18n_payloads/dashboard';
import DashboardTransformer from '#app/core/transformers/dashboard_transformer';
import { GetDashboardStatsAction } from '#core/actions/get_dashboard_stats_action';
import { DashboardRegistry } from '#core/services/dashboard_registry';
import { I18nService } from '#services/i18n_service';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class DashboardController {
	constructor(
		protected i18n: I18nService,
		protected getDashboardStatsAction: GetDashboardStatsAction,
		protected registry: DashboardRegistry,
	) {}

	/**
	 * Renders the admin dashboard with aggregated CMS statistics and recent
	 * activity, freshly computed on every request.
	 */
	async render(ctx: HttpContext) {
		const { inertia } = ctx;

		const stats = await this.getDashboardStatsAction.execute();

		const core = buildDashboardPayload(this.i18n);
		const fragments = this.registry.getTranslationBuilders().map((fn) => fn(this.i18n));
		const translations = Object.assign({ ...core }, ...fragments);

		return inertia.render('core/admin/dashboard', {
			stats: DashboardTransformer.transform(stats),
			translations,
		});
	}
}
