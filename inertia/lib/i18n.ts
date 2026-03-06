import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

interface JsonModule {
  default: Record<string, any>
}

/**
 * import.meta.glob scans the locals folder.
 * - eager: true allows files to be imported immediately (no promises)
 * - { as: 'json' } is useful if these are not standard JS/TS files
 */
const locales = import.meta.glob<JsonModule>('~/locales/**/*.json', { eager: true })

const resources: Record<string, any> = {}
const namespaces: string[] = []

/**
 * We iterate over the files found by Vite.
 * The path looks like: /locales/en/admin.json
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
