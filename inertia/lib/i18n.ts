import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

interface JsonModule {
  default: Record<string, any>
}

/**
 * i18next configuration for the application.
 *
 * Locale files are discovered at build time via `import.meta.glob` scanning
 * `~/locales/**\/*.json`. Each file's path is parsed to extract the language
 * code and namespace (e.g. `locales/en/admin.json` → `lng: 'en'`, `ns: 'admin'`).
 * All discovered namespaces are registered dynamically so adding a new JSON
 * file is enough to make it available — no manual registration required.
 *
 * **Interpolation** uses `{` / `}` delimiters instead of the i18next defaults
 * (`{{` / `}}`) to align with AdonisJS Edge template syntax. HTML escaping is
 * disabled because React already handles XSS protection.
 *
 * **Date formatting** is handled via the `format` callback using
 * `Intl.DateTimeFormat`. Pass a `Date` instance as the interpolation value
 * and use the format key as the `dateStyle` (`'short'`, `'medium'`, `'long'`,
 * `'full'`). Add `{ withTime: true }` to include a short time string.
 *
 * @example
 * // Translating a key
 * t('admin:users.list.title')
 *
 * // Formatting a date
 * t('common:created_at', { date: new Date(), format: 'medium' })
 *
 * // Formatting a date with time
 * i18n.format(new Date(), 'long', 'en', { withTime: true })
 */

/**
 * `import.meta.glob` scans the locales folder eagerly so all JSON files are
 * bundled and available synchronously — no async loading, no Suspense needed.
 */
const locales = import.meta.glob<JsonModule>('~/locales/**/*.json', { eager: true })

const resources: Record<string, any> = {}
const namespaces: string[] = []

/**
 * Parse each discovered path to build the i18next `resources` map.
 * Path format: `…/locales/<lng>/<namespace>.json`
 */
Object.keys(locales).forEach((path) => {
  const parts = path.split('/')
  const lng = parts[parts.length - 2]
  const ns = parts[parts.length - 1].replace('.json', '')

  if (!resources[lng]) {
    resources[lng] = {}
  }

  resources[lng][ns] = locales[path].default

  if (!namespaces.includes(ns)) {
    namespaces.push(ns)
  }
})

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: namespaces,
  interpolation: {
    escapeValue: false,
    prefix: '{',
    suffix: '}',
    format: (value, format, lng, options) => {
      if (value instanceof Date) {
        const dateStyle = (format || 'long') as 'long' | 'full' | 'medium' | 'short'

        return new Intl.DateTimeFormat(lng, {
          dateStyle: dateStyle,
          ...(options?.withTime && { timeStyle: 'short' }),
        }).format(value)
      }
      return value
    },
  },
  react: {
    useSuspense: false,
  },
})

export default i18n
