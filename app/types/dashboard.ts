import type { DateTime } from 'luxon'
import type { PageStatus } from '#types/page'

/**
 * Aggregated, read-only snapshot of the CMS state shown on the admin dashboard.
 *
 * Built by `GetDashboardStatsAction` from dedicated repository queries and
 * serialized for Inertia by `DashboardTransformer`.
 */
export interface DashboardStats {
  counts: DashboardCounts
  usersByRole: DashboardRoleCount[]
  filesByFolder: DashboardFolderFileCount[]
  recentPublishedPages: DashboardRecentPage[]
  recentFiles: DashboardRecentFile[]
}

/** Headline figures for each managed resource. */
export interface DashboardCounts {
  users: number
  pages: number
  /** Page translations grouped by publication status, plus the grand total. */
  pageTranslations: Record<PageStatus, number> & { total: number }
  /** Number of unique locales having at least one published page translation. */
  publishedLocales: number
  files: number
  fileFolders: number
  templates: number
}

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
