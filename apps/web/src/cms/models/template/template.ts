import { belongsTo, column } from '@adonisjs/lucid/orm';
import { TemplateSchema } from '#database/schema';
import File from '#file/models/file';
import User from '#identity/models/user';
import type { BlockType, PageContent } from '#cms/types/page';
import type { TemplateType } from '#cms/types/template';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

export default class Template extends TemplateSchema {
	@column()
	declare type: TemplateType;

	@column()
	declare blockType: BlockType | null;

	@column()
	declare content: PageContent;

	@belongsTo(() => File, { foreignKey: 'thumbnailId' })
	declare thumbnail: BelongsTo<typeof File>;

	@belongsTo(() => User, { foreignKey: 'createdBy' })
	declare author: BelongsTo<typeof User>;
}
