import { PageRevisionSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import PageTranslation from '#cms/models/page/page_translation'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/auth/user'
import type { PageContent } from '#cms/types/page'

export default class PageRevision extends PageRevisionSchema {
  declare content: PageContent

  @belongsTo(() => PageTranslation, { foreignKey: 'pageTranslationId' })
  declare translation: BelongsTo<typeof PageTranslation>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare author: BelongsTo<typeof User>
}
