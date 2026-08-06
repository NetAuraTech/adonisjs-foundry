import type { DateTime } from 'luxon'
import type { PageStatus } from '#types/page'

/** Number of users holding a given role; `name` is `null` for users without a role. */
export interface DashboardRoleCount {
  name: string | null
  count: number
}

/** Number of files directly contained in a folder (not recursive). */
export interface DashboardFolderFileCount {
  id: number
  name: string
  count: number
}

/** A recently published page translation entry for the dashboard activity list. */
export interface DashboardRecentPage {
  id: number
  pageId: number
  title: string
  slug: string
  locale: string
  publishedAt: DateTime | null
}

/** A recently uploaded file entry for the dashboard activity list. */
export interface DashboardRecentFile {
  id: number
  originalName: string
  mimeType: string
  size: number
  createdAt: DateTime
}

/** Dashboard section contributed by the auth domain. */
export interface DashboardAuthSection {
  users: number
  usersByRole: DashboardRoleCount[]
}

/** Dashboard section contributed by the page domain. */
export interface DashboardPageSection {
  pages: number
  /** Page translations grouped by publication status, plus the grand total. */
  pageTranslations: Record<PageStatus, number> & { total: number }
  /** Number of unique locales having at least one published page translation. */
  publishedLocales: number
  recentPublishedPages: DashboardRecentPage[]
}

/** Dashboard section contributed by the template domain. */
export interface DashboardTemplateSection {
  templates: number
}

/** Dashboard section contributed by the file domain. */
export interface DashboardFileSection {
  files: number
  fileFolders: number
  filesByFolder: DashboardFolderFileCount[]
  recentFiles: DashboardRecentFile[]
}

/**
 * Aggregated, read-only snapshot of the CMS state shown on the admin
 * dashboard, keyed by section.
 *
 * Every section is optional: it is present only when its domain registered a
 * dashboard collector in the composition module (`start/dashboard.ts`), so
 * each domain can be dropped without leaving empty figures behind. Built by
 * `GetDashboardStatsAction` and serialized for Inertia by
 * `DashboardTransformer`.
 */
export interface DashboardStats {
  auth?: DashboardAuthSection
  page?: DashboardPageSection
  template?: DashboardTemplateSection
  file?: DashboardFileSection
}

/** Input forwarded by the stats action to every registered collector. */
export interface DashboardCollectorPayload {
  /** Maximum number of entries per recent-activity list. */
  recentLimit: number
}

/**
 * Contribution contract for one dashboard section.
 *
 * Implementations live in their own domain, are registered in the composition
 * module, and return the section data matching their key in
 * {@link DashboardStats} — so a collector cannot drift from the payload shape
 * the React page expects.
 */
export interface DashboardCollector<K extends keyof DashboardStats = keyof DashboardStats> {
  collect(payload: DashboardCollectorPayload): Promise<NonNullable<DashboardStats[K]>>
}
