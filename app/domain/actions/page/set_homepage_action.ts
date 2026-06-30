import { inject } from '@adonisjs/core'
import { PageRepository } from '#repositories/page/page_repository'
import { LogService } from '#services/logging/log_service'
import { withTransaction } from '#shared/utils/with_transaction'

interface SetHomepagePayload {
  pageId: number
  userId: number
}

/**
 * Set a page as the site homepage, clearing the flag on any previous homepage.
 */
@inject()
export class SetHomepageAction {
  constructor(
    protected pageRepository: PageRepository,
    protected logService: LogService
  ) {}

  /**
   * Execute homepage assignment.
   *
   * @param payload - Page ID to mark as home and acting user ID.
   */
  async execute(payload: SetHomepagePayload): Promise<void> {
    await withTransaction(async () => {
      await this.pageRepository.setHomepage(payload.pageId)
    })
    this.logService.logBusiness(
      'page.homepage.set',
      { userId: payload.userId },
      { pageId: payload.pageId }
    )
  }
}
