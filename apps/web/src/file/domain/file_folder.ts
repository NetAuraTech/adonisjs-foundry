import { FileFolderIdentifier } from '#file/domain/identifiers';

/**
 * Pure domain object for a file folder.
 *
 * A {@link FileFolder} is a node in the folder tree: folders may nest under a
 * parent folder, and a folder with no parent is a root. The Lucid `FileFolder`
 * model is the persistence representation; hydrate one from a model with
 * {@link FileFolder.fromModel}.
 */
export class FileFolder {
	private constructor(
		readonly id: FileFolderIdentifier,
		readonly name: string,
		readonly parentId: number | null,
	) {}

	/**
	 * Hydrate a domain folder from its Lucid model representation.
	 *
	 * @param model - The persisted folder.
	 */
	static fromModel(model: { id: number; name: string; parentId: number | null }): FileFolder {
		return new FileFolder(FileFolderIdentifier.of(model.id), model.name, model.parentId);
	}

	/** Whether this folder is a root (has no parent). */
	isRoot(): boolean {
		return this.parentId === null;
	}
}
