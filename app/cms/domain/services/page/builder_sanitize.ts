import {
  sanitizePageContent,
  purify,
  PURIFY_CONFIG,
} from '#cms/domain/services/page/sanitize_content'
import type { PageContent } from '#cms/types/page'

/**
 * Sanitizes builder operation payloads before broadcast/storage.
 * Reuses the same DOMPurify config as page content sanitization.
 */
export function sanitizeBuilderOperation(
  op: string,
  payload: Record<string, unknown>
): Record<string, unknown> {
  switch (op) {
    case 'UPDATE_PROPS': {
      if (!payload.props || typeof payload.props !== 'object') return payload
      // Sanitize any string fields in props that could contain HTML
      const safeProps = sanitizeProps(payload.props as Record<string, unknown>)
      return { ...payload, props: safeProps }
    }

    case 'ADD_BLOCK': {
      if (!payload.block || typeof payload.block !== 'object') return payload
      // Full block sanitization: convert to PageContent-like structure and sanitize
      const safeBlock = sanitizeBlock(payload.block as Record<string, unknown>)
      return { ...payload, block: safeBlock }
    }

    default:
      return payload
  }
}

/**
 * Fields that may carry rich-text HTML across all block types.
 */
const RICH_TEXT_FIELDS = [
  'text',
  'content',
  'html',
  'label',
  'placeholder',
  'helpText',
  'caption',
  'attribution',
]

/**
 * Array fields whose string entries may carry rich-text HTML (list items).
 */
const RICH_TEXT_ARRAY_FIELDS = ['items']

function sanitizeProps(props: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      // Only sanitize fields that could contain HTML
      if (RICH_TEXT_FIELDS.includes(key)) {
        safe[key] = sanitizeHtml(value)
      } else {
        safe[key] = value
      }
    } else if (Array.isArray(value)) {
      safe[key] = RICH_TEXT_ARRAY_FIELDS.includes(key)
        ? value.map((item) => (typeof item === 'string' ? sanitizeHtml(item) : item))
        : value
    } else if (typeof value === 'object' && value !== null) {
      safe[key] = sanitizeProps(value as Record<string, unknown>)
    } else {
      safe[key] = value
    }
  }
  return safe
}

function sanitizeBlock(block: Record<string, unknown>): Record<string, unknown> {
  const safe = { ...block }
  if (block.props && typeof block.props === 'object') {
    safe.props = sanitizeProps(block.props as Record<string, unknown>)
  }
  if (block.children && Array.isArray(block.children)) {
    safe.children = block.children.map((child) => sanitizeBlock(child as Record<string, unknown>))
  }
  return safe
}

function sanitizeHtml(html: string): string {
  return purify.sanitize(html, PURIFY_CONFIG)
}

/**
 * Sanitizes draft content before storing in Redis.
 * Reuses the existing page content sanitization logic.
 */
export function sanitizeDraftContent(content: PageContent): PageContent {
  return sanitizePageContent(content)
}
