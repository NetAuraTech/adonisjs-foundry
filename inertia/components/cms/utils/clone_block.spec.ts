import { describe, it, expect } from 'vitest';
import { cloneBlock } from './clone_block';
import type { Block } from '#cms/types/page';

/**
 * Minimal Vitest coverage for the pure block-clone helper. A stored Block
 * Template is immutable source; every insertion must produce a tree with
 * brand-new ids for every nested block so optimistic field locks and
 * presence never collide (user story 7).
 */
function collectIds(block: Block, into: string[] = []): string[] {
	into.push(block.id);
	block.children?.forEach((child) => collectIds(child, into));
	return into;
}

describe('cloneBlock', () => {
	const source: Block = {
		id: 'tpl-root',
		type: 'section',
		props: {
			background: 'canvas',
			paddingY: { default: 'md' },
			paddingX: { default: 'sm' },
		},
		children: [
			{
				id: 'tpl-child-1',
				type: 'paragraph',
				props: { text: 'Child one', fs: 'base', variant: 'ink', spacing: 'base' },
			},
			{
				id: 'tpl-child-2',
				type: 'grid',
				props: { cols: { default: 2 }, gap: { default: 'md' } },
				children: [
					{
						id: 'tpl-grandchild',
						type: 'paragraph',
						props: { text: 'Nested', fs: 'sm', variant: 'muted', spacing: 'sm' },
					},
				],
			},
		],
	};

	it('regenerates the id for every block in the subtree', () => {
		const cloned = cloneBlock(source);
		const sourceIds = collectIds(source);
		const clonedIds = collectIds(cloned);

		expect(clonedIds).toHaveLength(sourceIds.length);
		for (const id of clonedIds) {
			expect(sourceIds).not.toContain(id);
		}
	});

	it('produces unique ids across two clones of the same source', () => {
		const first = collectIds(cloneBlock(source));
		const second = collectIds(cloneBlock(source));

		for (const id of first) {
			expect(second).not.toContain(id);
		}
	});

	it('preserves the block types and prop values of the source tree', () => {
		const cloned = cloneBlock(source);

		expect(cloned.type).toBe('section');
		expect(cloned.props).toEqual({
			background: 'canvas',
			paddingY: { default: 'md' },
			paddingX: { default: 'sm' },
		});
		expect(cloned.children?.map((child) => child.type)).toEqual(['paragraph', 'grid']);
		expect(cloned.children?.[1].children?.[0].props).toEqual({
			text: 'Nested',
			fs: 'sm',
			variant: 'muted',
			spacing: 'sm',
		});
	});

	it('does not share object references with the source', () => {
		const cloned = cloneBlock(source);

		expect(cloned).not.toBe(source);
		expect(cloned.props).not.toBe(source.props);
		expect((cloned.props as Record<string, unknown>).paddingY).not.toBe(
			(source.props as Record<string, unknown>).paddingY,
		);
		expect(cloned.children?.[0]).not.toBe(source.children?.[0]);
	});

	it('never mutates the template source when the clone is edited', () => {
		const cloned = cloneBlock(source);
		(cloned.props as Record<string, unknown>).background = 'Edited after insert';
		cloned.children![0].props = { text: 'Overwritten', fs: 'base', variant: 'ink', spacing: 'base' };

		expect((source.props as Record<string, unknown>).background).toBe('canvas');
		expect(source.children![0].props).toEqual({
			text: 'Child one',
			fs: 'base',
			variant: 'ink',
			spacing: 'base',
		});
	});

	it('uses the injected id generator for deterministic, collision-free ids', () => {
		let counter = 0;
		const gen = () => `block-clone-${++counter}`;
		const cloned = cloneBlock(source, gen);

		// The generator produced exactly one id per node (4 nodes in `source`:
		// root section, two children, and one grandchild under the grid).
		expect(counter).toBe(4);
		const ids = collectIds(cloned);
		expect(ids).toEqual(['block-clone-1', 'block-clone-2', 'block-clone-3', 'block-clone-4']);

		// Two separate clones with fresh generators never collide.
		let a = 0;
		let b = 100;
		const genA = () => `a-${++a}`;
		const genB = () => `b-${++b}`;
		const idsA = collectIds(cloneBlock(source, genA));
		const idsB = collectIds(cloneBlock(source, genB));
		for (const id of idsA) {
			expect(idsB).not.toContain(id);
		}
	});
});
