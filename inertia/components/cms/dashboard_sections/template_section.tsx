import { CanAccess } from '~/guards/can_access'
import { useTranslation } from '~/hooks/use_translation'
import { StatCard } from '~/components/dashboard_sections/stat_card'
import { registerDashboardSection, type DashboardSectionCardProps } from '~/lib/dashboard_sections'
import type { Data } from '@generated/data'

/**
 * Template dashboard section card: the total template count.
 *
 * Registered into the client-side section registry at module load. Renders as
 * a standalone card only when the page section is absent — when both exist the
 * page card shows the template count nested inside it. This module lives in
 * the CMS subtree (`inertia/components/cms/`), so the `inertia` flavor prunes
 * it entirely and the dashboard never renders a template section.
 */
function TemplateStatCard({ stats, translations }: DashboardSectionCardProps) {
  const { t } = useTranslation(translations)
  const template: Data.Dashboard['template'] = stats.template

  if (!template || stats.page) return null

  return (
    <CanAccess permission="templates.view">
      <StatCard
        icon="LayoutTemplate"
        label={t('cards.templates')}
        value={template.templates}
        route="admin.templates.render"
      />
    </CanAccess>
  )
}

registerDashboardSection('template', { Stat: TemplateStatCard })
