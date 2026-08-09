import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { MaintenanceService } from '#services/maintenance/maintenance_service'
import { LogService } from '#services/logging/log_service'
import { updateMaintenanceValidator, toggleMaintenanceValidator } from '#validators/maintenance'

/**
 * GET /api/v1/admin/maintenance — current maintenance configuration and
 * effective runtime state.
 */
@inject()
export default class MaintenanceApiController {
  constructor(
    protected maintenanceService: MaintenanceService,
    protected logService: LogService
  ) {}

  async index() {
    const config = await this.maintenanceService.getConfig()
    const effectiveConfig = await this.maintenanceService.getEffectiveConfig()

    return {
      config: {
        enabled: config.enabled,
        message: config.message,
        allowedIps: config.allowedIps,
        retryAfter: config.retryAfter,
        scheduled: config.scheduled,
      },
      effectiveEnabled: effectiveConfig.enabled,
      redisAvailable: this.maintenanceService.isRedisAvailable(),
      source: this.maintenanceService.getSource(),
    }
  }

  /**
   * PUT /api/v1/admin/maintenance — update maintenance configuration.
   */
  async update(ctx: HttpContext) {
    const { request, response } = ctx
    const payload = await updateMaintenanceValidator.validate(request.all())

    await this.maintenanceService.setConfig({
      enabled: payload.enabled ?? false,
      message: payload.message ?? '',
      allowedIps: payload.allowedIps ?? [],
    })

    this.logService.logBusiness(
      'settings.maintenance.updated',
      {},
      { enabled: payload.enabled ?? false, allowedIpsCount: (payload.allowedIps ?? []).length }
    )

    const config = await this.maintenanceService.getConfig()
    return response.ok({ config })
  }

  /**
   * PUT /api/v1/admin/maintenance/toggle — toggle maintenance mode on/off.
   */
  async toggle(ctx: HttpContext) {
    const { request, response } = ctx
    const { enabled } = await toggleMaintenanceValidator.validate(request.all())

    await this.maintenanceService.toggle(enabled)

    this.logService.logBusiness('settings.maintenance.toggled', {}, { enabled })

    return response.ok({ enabled })
  }
}
