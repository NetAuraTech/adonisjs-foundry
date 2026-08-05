import { inject } from '@adonisjs/core'
import { UserRepository } from '#repositories/auth/user_repository'
import { PageRepository } from '#repositories/page/page_repository'
import { PageTranslationRepository } from '#repositories/page/page_translation_repository'
import { FileRepository } from '#repositories/file/file_repository'
import { FileFolderRepository } from '#repositories/file/file_folder_repository'
import { TemplateRepository } from '#repositories/template/template_repository'
import type { DashboardStats } from '#types/dashboard'

interface GetDashboardStatsPayload {
  /** Maximum number of entries per recent-activity list. Defaults to 5. */
  recentLimit?: number
}

/**
 * Aggregate the CMS headline figures and recent activity shown on the admin
 * dashboard.
 *
 * Read-only: every figure comes from a dedicated repository aggregate or a
 * bounded recent-items query — no full table loads — so the dashboard stays
 * cheap as data grows. All queries run in parallel.
 */
@inject()
export class GetDashboardStatsAction {
  constructor(
    protected userRepository: UserRepository,
    protected pageRepository: PageRepository,
    protected pageTranslationRepository: PageTranslationRepository,
    protected fileRepository: FileRepository,
    protected fileFolderRepository: FileFolderRepository,
    protected templateRepository: TemplateRepository
  ) {}

  /**
   * Execute the dashboard aggregation.
   *
   * @param payload - Optional recent-activity list limit.
   * @returns The aggregated {@link DashboardStats} snapshot.
   *
   * @example
   * const stats = await getDashboardStatsAction.execute({ recentLimit: 5 })
   */
  async execute(payload: GetDashboardStatsPayload = {}): Promise<DashboardStats> {
    const recentLimit = payload.recentLimit ?? 5

    const [
      users,
      usersByRole,
      pages,
      translationsByStatus,
      publishedLocales,
      files,
      fileFolders,
      filesByFolder,
      templates,
      recentPublishedPages,
      recentFiles,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.countByRole(),
      this.pageRepository.count(),
      this.pageTranslationRepository.countByStatus(),
      this.pageTranslationRepository.countPublishedLocales(),
      this.fileRepository.count(),
      this.fileFolderRepository.count(),
      this.fileFolderRepository.listWithFileCounts(),
      this.templateRepository.count(),
      this.pageTranslationRepository.listRecentlyPublished(recentLimit),
      this.fileRepository.listRecent(recentLimit),
    ])

    const totalTranslations =
      translationsByStatus.draft + translationsByStatus.published + translationsByStatus.archived

    return {
      counts: {
        users,
        pages,
        pageTranslations: {
          ...translationsByStatus,
          total: totalTranslations,
        },
        publishedLocales,
        files,
        fileFolders,
        templates,
      },
      usersByRole,
      filesByFolder,
      recentPublishedPages: recentPublishedPages.map((translation) => ({
        id: translation.id,
        pageId: translation.pageId,
        title: translation.title,
        slug: translation.slug,
        locale: translation.locale,
        publishedAt: translation.publishedAt,
      })),
      recentFiles: recentFiles.map((file) => ({
        id: file.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: Number(file.size),
        createdAt: file.createdAt,
      })),
    }
  }
}
