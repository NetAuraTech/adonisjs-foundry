import type { I18nService } from '#services/i18n_service'

export function buildCmsMaintenanceIndexPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'cms.settings.maintenance.value',
    sub_title: 'cms.settings.maintenance.sub_title',
    status: {
      label: 'cms.settings.maintenance.status.label',
      inactive: 'cms.settings.maintenance.status.inactive',
      active_redis: 'cms.settings.maintenance.status.active_redis',
      active_memory: 'cms.settings.maintenance.status.active_memory',
    },
    source: {
      redis: 'cms.settings.maintenance.source.redis',
      memory: 'cms.settings.maintenance.source.memory',
      memory_warning: 'cms.settings.maintenance.source.memory_warning',
      redis_unavailable: 'cms.settings.maintenance.source.redis_unavailable',
    },
    toggle: {
      label: 'cms.settings.maintenance.toggle.label',
      enable: 'cms.settings.maintenance.toggle.enable',
      disable: 'cms.settings.maintenance.toggle.disable',
      is_enabled: 'cms.settings.maintenance.toggle.is_enabled',
      is_disabled: 'cms.settings.maintenance.toggle.is_disabled',
    },
    message: {
      label: 'cms.settings.maintenance.message.label',
      placeholder: 'cms.settings.maintenance.message.placeholder',
      value: 'cms.settings.maintenance.message.value',
    },
    allowed_ips: {
      label: 'cms.settings.maintenance.allowed_ips.label',
      placeholder: 'cms.settings.maintenance.allowed_ips.placeholder',
      help: 'cms.settings.maintenance.allowed_ips.help',
    },
    schedule: {
      title: 'cms.settings.maintenance.schedule.title',
      enable: 'cms.settings.maintenance.schedule.enable',
      start: 'cms.settings.maintenance.schedule.start',
      end: 'cms.settings.maintenance.schedule.end',
      help: 'cms.settings.maintenance.schedule.help',
    },
    submit: 'cms.settings.maintenance.submit',
    memory: {
      title: 'cms.settings.maintenance.memory.title',
      description: 'cms.settings.maintenance.memory.description',
    },
    redis_down: {
      title: 'cms.settings.maintenance.redis_down.title',
      description: 'cms.settings.maintenance.redis_down.description',
      help: 'cms.settings.maintenance.redis_down.help',
    },
  })
}

export function buildMaintenanceIndexPayload(i18n: I18nService) {
  return i18n.buildPayload({
    title: 'page.maintenance.title',
    default_message: 'page.maintenance.default_message',
    retry_in: 'page.maintenance.retry_in',
    retry_now: 'page.maintenance.retry_now',
  })
}
