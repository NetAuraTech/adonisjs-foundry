import { inject } from '@adonisjs/core'
import { TemplateRepository } from '#repositories/template/template_repository'
import type { DashboardCollector, DashboardTemplateSection } from '#types/dashboard'

/**
 * Contributes the template section of the admin dashboard: the total template
 * count.
 *
 * Read-only: the figure comes from a dedicated repository aggregate — no full
 * table load — so the dashboard stays cheap as data grows.
 */
@inject()
export class TemplateDashboardCollector implements DashboardCollector<'template'> {
  constructor(protected templateRepository: TemplateRepository) {}

  /**
   * Collect the template dashboard section.
   *
   * @returns The total template count.
   */
  async collect(): Promise<DashboardTemplateSection> {
    return { templates: await this.templateRepository.count() }
  }
}
