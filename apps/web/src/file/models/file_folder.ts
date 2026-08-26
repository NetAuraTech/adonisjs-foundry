import { belongsTo, hasMany, scope } from '@adonisjs/lucid/orm';
import { FileFolderSchema } from '#database/schema';
import File from '#file/models/file';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';

export default class FileFolder extends FileFolderSchema {
	@belongsTo(() => FileFolder, { foreignKey: 'parentId' })
	declare parent: BelongsTo<typeof FileFolder>;

	@hasMany(() => FileFolder, { foreignKey: 'parentId' })
	declare children: HasMany<typeof FileFolder>;

	@hasMany(() => File, { foreignKey: 'folderId' })
	declare files: HasMany<typeof File>;

	static roots = scope((query) => {
		query.whereNull('parent_id');
	});
}
