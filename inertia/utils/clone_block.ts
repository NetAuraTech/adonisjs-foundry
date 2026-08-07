import type { Block } from '#cms/types/page'
import { generateBlockId } from '~/components/organisms/builder/block_types'

/** Function that produces a fresh block id. Injectable for deterministic tests. */
export type BlockIdGenerator = () => string

/**
 * Deep-clones a Block subtree and assigns every node a brand-new id.
 *
 * This is the pure, reducer-adjacent seam of the template insertion flow: a
 * stored Block Template is immutable source, and every insertion must behave
 * exactly like a block added from the palette — fresh ids for every nested
 * block so optimistic field locks and presence never collide with the same
 * block twice (user story 7).
 *
 * Props are deep-cloned too so the inserted tree shares no object references
 * with the template source (templates are never mutated).
 *
 * @param block - The source block (typically from a Block Template).
 * @param generateId - Optional id generator (defaults to the builder's
 *   `generateBlockId`). Inject a counter-based generator in tests for
 *   deterministic id assertions.
 * @returns A structurally identical block with new ids and cloned props.
 */
export function cloneBlock(block: Block, generateId: BlockIdGenerator = generateBlockId): Block {
  return {
    ...block,
    id: generateId(),
    props: cloneProps(block.props),
    children: block.children?.map((child) => cloneBlock(child, generateId)),
  }
}

function cloneProps(props: Block['props']): Block['props'] {
  if (Array.isArray(props)) {
    return props.map((value) => cloneValue(value)) as Block['props']
  }
  if (props && typeof props === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(props)) {
      out[key] = cloneValue(value)
    }
    return out as Block['props']
  }
  return props
}

function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry))
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      out[key] = cloneValue(entry)
    }
    return out
  }
  return value
}
