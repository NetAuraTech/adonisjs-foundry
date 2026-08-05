import { BaseTransformer } from '@adonisjs/core/transformers'
import type { DashboardStats } from '#types/dashboard'

/**
 * Shapes the aggregated {@link DashboardStats} snapshot for the Inertia
 * dashboard page. Luxon `DateTime` values are passed through and serialize
 * to ISO strings in the JSON payload.
 */
export default class DashboardTransformer extends BaseTransformer<DashboardStats> {
  async toObject() {
    return {
      counts: this.resource.counts,
      usersByRole: this.resource.usersByRole,
      filesByFolder: this.resource.filesByFolder,
      recentPublishedPages: this.resource.recentPublishedPages,
      recentFiles: this.resource.recentFiles,
    }
  }
}
