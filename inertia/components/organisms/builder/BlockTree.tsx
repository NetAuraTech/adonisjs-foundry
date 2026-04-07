import { useState } from 'react'
import BlockPicker from './BlockPicker'
import BlockPropsEditor from './BlockPropsEditor'
import { createBlock, getBlockDescriptor } from './block_types'
import type { Block, BlockType, PageContent } from '#types/page'
import type { BuilderOperation } from '#types/builder'
import type { LockState } from '~/hooks/use_builder_sync'
import { Button } from '~/components/atoms/button'
import { Icon } from '~/components/atoms/icon'

interface LockHelpers {
  getLock: (blockId: string, fieldKey: string) => LockState | null
  acquireLock: (blockId: string, fieldKey: string) => Promise<{ acquired: boolean; lock?: any }>
  releaseLock: (blockId: string, fieldKey: string) => Promise<void>
  currentUserId: number
}

interface BlockTreeProps {
  content: PageContent
  onChange: (content: PageContent) => void
  onOperation?: (op: BuilderOperation) => void
  getLock?: LockHelpers['getLock']
  acquireLock?: LockHelpers['acquireLock']
  releaseLock?: LockHelpers['releaseLock']
  currentUserId?: number
}

export default function BlockTree({
  content,
  onChange,
  onOperation,
  getLock,
  acquireLock,
  releaseLock,
  currentUserId = 0,
}: BlockTreeProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pickerParentId, setPickerParentId] = useState<string | 'root' | null>(null)

  function applyBlocks(updater: (b: Block[]) => Block[]) {
    onChange({ ...content, blocks: updater(content.blocks) })
  }

  function addBlock(type: BlockType, parentId: 'root' | string) {
    const newBlock = createBlock(type)
    setPickerParentId(null)
    setSelectedId(newBlock.id)
    if (parentId === 'root') {
      const next = [...content.blocks, newBlock]
      applyBlocks(() => next)
      onOperation?.({ op: 'ADD_BLOCK', block: newBlock, parentId: 'root', index: next.length - 1 })
    } else {
      applyBlocks((b) => insertChild(b, parentId, newBlock))
      const parent = findById(content.blocks, parentId)
      onOperation?.({
        op: 'ADD_BLOCK',
        block: newBlock,
        parentId,
        index: parent?.children?.length ?? 0,
      })
    }
  }

  function deleteBlock(id: string) {
    if (selectedId === id) setSelectedId(null)
    applyBlocks((b) => removeById(b, id))
    onOperation?.({ op: 'DELETE_BLOCK', blockId: id })
  }

  function moveBlock(id: string, direction: 'up' | 'down') {
    const { parentId, index } = findParentInfo(content.blocks, id)
    const newIndex = direction === 'up' ? index - 1 : index + 1
    applyBlocks((b) => moveInTree(b, id, direction))
    onOperation?.({
      op: 'MOVE_BLOCK',
      blockId: id,
      newParentId: parentId,
      newIndex: Math.max(0, newIndex),
    })
  }

  function updateBlockProps(id: string, props: Block['props']) {
    applyBlocks((b) => updateProps(b, id, props))
    onOperation?.({ op: 'UPDATE_PROPS', blockId: id, props })
  }

  const selectedBlock = selectedId ? findById(content.blocks, selectedId) : null

  const handleCloseBlockPicker = () => {
    setPickerParentId(null)
  }

  return (
    <div className="flex gap-4 h-full min-h-0">
      <div className="w-auto flex flex-col gap-3 overflow-hidden">
        <div className="flex gap-3 h-1/2 overflow-y-scroll">
          <div className="relative">
            <Button
              type="button"
              variant="icon"
              onClick={() => setPickerParentId(pickerParentId === 'root' ? null : 'root')}
              fitContent
              title="Add block to translate"
            >
              <Icon name="Plus" size={18} />
            </Button>
            {pickerParentId === 'root' && (
              <BlockPicker
                onSelect={(t) => addBlock(t, 'root')}
                handleClose={handleCloseBlockPicker}
                className="absolute top-7 left-0 z-30 w-72"
              />
            )}
          </div>

          {content.blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed border-edge text-center">
              <p className="text-sm text-ink-muted">No blocks yet</p>
              <p className="text-xs text-ink-subtle mt-1">Click "Add block" to start building</p>
            </div>
          ) : (
            <div className="space-y-1">
              {content.blocks.map((block, i) => (
                <BlockNode
                  key={block.id}
                  block={block}
                  index={i}
                  total={content.blocks.length}
                  depth={0}
                  selectedId={selectedId}
                  pickerParentId={pickerParentId}
                  onSelect={setSelectedId}
                  onDelete={deleteBlock}
                  onMove={moveBlock}
                  onAddChild={(pid) => setPickerParentId(pickerParentId === pid ? null : pid)}
                  onPickBlock={addBlock}
                  handleCloseBlockPicker={handleCloseBlockPicker}
                />
              ))}
            </div>
          )}
        </div>
        <div className="h-1/2 shrink-0 items-end">
          {selectedBlock ? (
            <div className="rounded-xl border border-edge bg-canvas top-4">
              <div className="px-4 py-3 border-b border-edge flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-ink">
                    {getBlockDescriptor(selectedBlock.type)?.label ?? selectedBlock.type}
                  </p>
                  <p className="text-xs text-ink-subtle font-mono mt-0.5 truncate max-w-47.5">
                    {selectedBlock.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-ink-subtle hover:text-ink text-xs p-1"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow max-h-[calc(100vh-18rem)]">
                <BlockPropsEditor
                  block={selectedBlock}
                  onChange={(props) => updateBlockProps(selectedBlock.id, props)}
                  getLock={getLock}
                  acquireLock={acquireLock}
                  releaseLock={releaseLock}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-edge p-6 text-center">
              <p className="text-xs text-ink-subtle">Select a block to edit its properties </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BlockNode(props: {
  block: Block
  index: number
  total: number
  depth: number
  selectedId: string | null
  pickerParentId: string | 'root' | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, d: 'up' | 'down') => void
  onAddChild: (pid: string) => void
  onPickBlock: (type: BlockType, pid: string) => void
  handleCloseBlockPicker: () => void
}) {
  const {
    block,
    index,
    total,
    depth,
    selectedId,
    pickerParentId,
    onSelect,
    onDelete,
    onMove,
    onAddChild,
    onPickBlock,
    handleCloseBlockPicker,
  } = props
  const [expanded, setExpanded] = useState(true)
  const descriptor = getBlockDescriptor(block.type)
  const isContainer = descriptor?.isContainer ?? false
  const isSelected = selectedId === block.id
  const showPicker = pickerParentId === block.id

  const preview =
    block.type === 'title'
      ? ` — ${(block.props as any).text ?? ''}`
      : block.type === 'hero'
        ? ` — ${(block.props as any).title ?? ''}`
        : block.type === 'rich_text'
          ? ' — rich text'
          : ''

  return (
    <div className={depth > 0 ? 'ml-5 pl-2 border-l border-edge' : ''}>
      <div
        className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary-soft border border-primary-mid/20'
            : 'hover:bg-sunken border border-transparent'
        }`}
        onClick={() => onSelect(block.id)}
      >
        {isContainer ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="w-4 h-4 flex items-center justify-center text-ink-muted shrink-0"
          >
            <svg
              className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        <span className="text-xs font-medium flex-1 min-w-0 truncate">
          {descriptor?.label ?? block.type}
          {preview && (
            <span className="text-ink-subtle font-normal">
              {preview.slice(0, 28)}
              {preview.length > 28 ? '…' : ''}
            </span>
          )}
        </span>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {(['up', 'down'] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              disabled={dir === 'up' ? index === 0 : index === total - 1}
              onClick={(e) => {
                e.stopPropagation()
                onMove(block.id, dir)
              }}
              className="p-1 rounded text-ink-subtle hover:text-ink disabled:opacity-30"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={dir === 'up' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                />
              </svg>
            </button>
          ))}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(block.id)
            }}
            className="p-1 rounded text-ink-subtle hover:text-danger"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {isContainer && expanded && (
        <div className="mt-1 space-y-1 ml-2">
          {(block.children ?? []).map((child, i) => (
            <BlockNode
              key={child.id}
              block={child}
              index={i}
              total={(block.children ?? []).length}
              depth={depth + 1}
              selectedId={selectedId}
              pickerParentId={pickerParentId}
              onSelect={onSelect}
              onDelete={onDelete}
              onMove={onMove}
              onAddChild={onAddChild}
              onPickBlock={onPickBlock}
              handleCloseBlockPicker={handleCloseBlockPicker}
            />
          ))}
          <div className="relative ml-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onAddChild(block.id)
              }}
              className="flex items-center gap-1.5 text-xs text-ink-subtle hover:text-primary-mid transition-colors py-1"
            >
              <span className="w-4 h-4 rounded border border-dashed border-edge flex items-center justify-center text-sm leading-none">
                +
              </span>
              Add child block
            </button>
            {showPicker && (
              <BlockPicker
                onSelect={(type) => onPickBlock(type, block.id)}
                handleClose={handleCloseBlockPicker}
                className="absolute top-7 left-0 z-30 w-72"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function findById(blocks: Block[], id: string): Block | null {
  for (const b of blocks) {
    if (b.id === id) return b
    if (b.children) {
      const f = findById(b.children, id)
      if (f) return f
    }
  }
  return null
}

function findParentInfo(
  blocks: Block[],
  id: string,
  parentId: string | 'root' = 'root'
): { parentId: string | 'root'; index: number } {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].id === id) return { parentId, index: i }
    if (blocks[i].children) {
      const r = findParentInfo(blocks[i].children!, id, blocks[i].id)
      if (r.index !== -1) return r
    }
  }
  return { parentId, index: -1 }
}

function removeById(blocks: Block[], id: string): Block[] {
  return blocks
    .filter((b) => b.id !== id)
    .map((b) => (b.children ? { ...b, children: removeById(b.children, id) } : b))
}

function insertChild(blocks: Block[], parentId: string, child: Block): Block[] {
  return blocks.map((b) => {
    if (b.id === parentId) return { ...b, children: [...(b.children ?? []), child] }
    if (b.children) return { ...b, children: insertChild(b.children, parentId, child) }
    return b
  })
}

function updateProps(blocks: Block[], id: string, props: Block['props']): Block[] {
  return blocks.map((b) => {
    if (b.id === id) return { ...b, props }
    if (b.children) return { ...b, children: updateProps(b.children, id, props) }
    return b
  })
}

function moveInTree(blocks: Block[], id: string, dir: 'up' | 'down'): Block[] {
  const idx = blocks.findIndex((b) => b.id === id)
  if (idx !== -1) {
    const next = [...blocks]
    const t = dir === 'up' ? idx - 1 : idx + 1
    if (t < 0 || t >= next.length) return blocks
    ;[next[idx], next[t]] = [next[t], next[idx]]
    return next
  }
  return blocks.map((b) => (b.children ? { ...b, children: moveInTree(b.children, id, dir) } : b))
}
