/**
 * Controls which sanitization transforms are applied by {@link sanitize}.
 *
 * Every option defaults to the value defined in {@link DEFAULT_OPTIONS}.
 * Pass only the options you want to override — the rest are merged from the defaults.
 */
export interface SanitizationOptions {
  /** Remove all HTML tags from the string. Default: `true`. */
  stripHtml?: boolean
  /** Trim leading and trailing whitespace. Default: `true`. */
  trim?: boolean
  /** Convert the string to lowercase. Default: `false`. */
  lowercase?: boolean
  /** Collapse consecutive whitespace characters into a single space. Default: `true`. */
  removeMultipleSpaces?: boolean
}

/**
 * Default sanitization options applied when no overrides are provided to {@link sanitize}.
 *
 * - HTML stripping and whitespace collapsing are enabled by default to prevent
 *   XSS and normalise user input.
 * - Lowercase conversion is disabled to preserve names and other case-sensitive values.
 */
const DEFAULT_OPTIONS: SanitizationOptions = {
  stripHtml: true,
  trim: true,
  lowercase: false,
  removeMultipleSpaces: true,
}

/**
 * Removes all HTML tags from a string.
 *
 * Only strips tags — HTML entities (e.g. `&amp;`, `&lt;`) are left intact.
 * For more thorough sanitization consider a dedicated library like DOMPurify.
 *
 * @param value - The string to strip tags from.
 * @returns The input string with all `<...>` sequences removed.
 *
 * @example
 * stripHtmlTags('<b>Hello</b> <script>alert(1)</script>') // 'Hello alert(1)'
 */
function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]*>/g, '')
}

/**
 * Replaces any sequence of whitespace characters with a single space.
 *
 * @param value - The string to normalise.
 * @returns The input string with consecutive whitespace collapsed.
 *
 * @example
 * removeMultipleSpaces('John   Doe') // 'John Doe'
 */
function removeMultipleSpaces(value: string): string {
  return value.replace(/\s+/g, ' ')
}

/**
 * Applies a configurable chain of sanitization transforms to a string.
 *
 * Transforms are applied in this fixed order:
 * 1. Strip HTML tags
 * 2. Trim whitespace
 * 3. Lowercase
 * 4. Collapse multiple spaces
 *
 * Options are merged with {@link DEFAULT_OPTIONS}, so you only need to
 * override the values you want to change.
 *
 * @param value - The raw string to sanitize.
 * @param options - Optional overrides for {@link SanitizationOptions}.
 * @returns The sanitized string.
 *
 * @example
 * sanitize('  <b>Hello</b>  World  ') // 'Hello World'
 * sanitize('  HELLO  ', { lowercase: true }) // 'hello'
 */
export function sanitize(value: string, options: SanitizationOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let sanitized = value

  if (opts.stripHtml) {
    sanitized = stripHtmlTags(sanitized)
  }

  if (opts.trim) {
    sanitized = sanitized.trim()
  }

  if (opts.lowercase) {
    sanitized = sanitized.toLowerCase()
  }

  if (opts.removeMultipleSpaces) {
    sanitized = removeMultipleSpaces(sanitized)
  }

  return sanitized
}

/**
 * Sanitizes an email address: trims whitespace and converts to lowercase.
 *
 * HTML stripping and space collapsing are intentionally disabled since a
 * valid email address never contains HTML or multiple consecutive spaces —
 * applying those transforms could silently corrupt the value.
 *
 * @param value - The raw email string to sanitize.
 * @returns The trimmed, lowercased email string.
 *
 * @example
 * sanitizeEmail('  John.Doe@Example.COM  ') // 'john.doe@example.com'
 */
export function sanitizeEmail(value: string): string {
  return sanitize(value, {
    stripHtml: false,
    trim: true,
    lowercase: true,
    removeMultipleSpaces: false,
  })
}

/**
 * Sanitizes a generic text input: strips HTML, trims whitespace, and
 * collapses consecutive spaces.
 *
 * Suitable for names, titles, descriptions, and any free-text field where
 * HTML injection should be prevented and whitespace normalised.
 *
 * @param value - The raw text string to sanitize.
 * @returns The sanitized text string.
 *
 * @example
 * sanitizeText('  <b>John</b>   Doe  ') // 'John Doe'
 */
export function sanitizeText(value: string): string {
  return sanitize(value, {
    stripHtml: true,
    trim: true,
    lowercase: false,
    removeMultipleSpaces: true,
  })
}

/**
 * Returns the input string unchanged.
 *
 * Used as a no-op sanitizer for sensitive fields such as passwords, where
 * any transformation — including trimming — could silently alter the value
 * the user intended to set.
 *
 * @param value - The raw string.
 * @returns The exact same string, unmodified.
 *
 * @example
 * noSanitization('  my$ecretP@ss  ') // '  my$ecretP@ss  '
 */
export function noSanitization(value: string): string {
  return value
}

/**
 * Returns the appropriate sanitizer function for a given HTML input type.
 *
 * Acts as a strategy selector: when `sanitize` is `false`, always returns
 * {@link noSanitization} regardless of type. Otherwise, the type is mapped
 * to a dedicated sanitizer:
 *
 * - `'email'` → {@link sanitizeEmail}
 * - `'password'` → {@link noSanitization}
 * - anything else → {@link sanitizeText}
 *
 * @param type - The HTML input type (e.g. `'email'`, `'password'`, `'text'`).
 * @param sanitize - Whether sanitization should be applied at all.
 * @returns A sanitizer function `(value: string) => string`.
 *
 * @example
 * const sanitizer = getSanitizer('email', true)
 * sanitizer('  USER@Example.com  ') // 'user@example.com'
 *
 * const noop = getSanitizer('text', false)
 * noop('  raw  ') // '  raw  '
 */
export function getSanitizer(type: string, sanitize: boolean) {
  if (!sanitize) return noSanitization

  switch (type) {
    case 'email':
      return sanitizeEmail
    case 'password':
      return noSanitization
    default:
      return sanitizeText
  }
}
