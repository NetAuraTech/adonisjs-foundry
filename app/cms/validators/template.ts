import vine from '@vinejs/vine';

const templateName = () => vine.string().trim().maxLength(255);
const templateDescription = () => vine.string().trim().maxLength(1000).nullable().optional();
const templateType = () => vine.enum(['page', 'block'] as const);
const locale = () => vine.string().trim().maxLength(10);

// Runtime mirror of the `BlockType` union so Vine can reject unknown values.
const blockTypes = [
	'section',
	'grid',
	'flex',
	'title',
	'paragraph',
	'button',
	'separator',
	'icon',
	'form',
	'field',
	'htmltext',
	'image',
] as const;

export const listTemplateValidator = vine.create({
	type: templateType().optional(),
	block_type: vine.enum(blockTypes).optional(),
	search: vine.string().trim().maxLength(255).optional(),
});

export const showTemplateValidator = vine.create({
	id: vine.number().positive(),
});

export const createTemplateValidator = vine.create({
	name: templateName(),
	description: templateDescription(),
	thumbnailId: vine.number().positive().nullable().optional(),
	type: templateType(),
	blockType: vine.string().trim().maxLength(50).nullable().optional(),
	content: vine.any(),
});

export const updateTemplateValidator = vine.create({
	name: templateName().optional(),
	description: templateDescription(),
	thumbnailId: vine.number().positive().nullable().optional(),
	content: vine.any().optional(),
});

export const applyTemplateValidator = vine.create({
	pageId: vine.number().positive(),
	locale: locale(),
});

export const createFromPageValidator = vine.create({
	name: templateName(),
	pageId: vine.number().positive(),
	locale: locale(),
	content: vine.any().optional(),
});

/**
 * Validates a Block Template submission coming from the builder.
 *
 * `content` must be a `PageContent` with exactly one root block — that block
 * (with its children) is what gets deep-cloned on insertion.
 */
export const createBlockTemplateValidator = vine.create({
	name: templateName(),
	description: templateDescription(),
	blockType: vine.enum(blockTypes),
	content: vine.object({
		blocks: vine.array(vine.any()).minLength(1).maxLength(1),
	}),
	overwriteId: vine.number().positive().nullable().optional(),
});

/**
 * Validates the query/params of the template preview route used for
 * thumbnail capture (token-protected like the page preview).
 */
export const templatePreviewValidator = vine.create({
	id: vine.number().positive(),
	locale: locale(),
	token: vine.string().trim(),
});
