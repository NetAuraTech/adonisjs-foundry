import { belongsTo } from '@adonisjs/lucid/orm';
import { FileAltSchema } from '#database/schema';
import File from '#models/file/file';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

export default class FileAlt extends FileAltSchema {
	@belongsTo(() => File, { foreignKey: 'fileId' })
	declare file: BelongsTo<typeof File>;
}
