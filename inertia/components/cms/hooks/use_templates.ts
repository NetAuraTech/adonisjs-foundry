import { useEffect, useState } from 'react'
import type { Data } from '@generated/data'

/**
 * Lazily fetches templates of a given `type` from the JSON API on mount.
 *
 * Shared by the builder's template pickers (block insertion and page apply),
 * which differ only in the template `type` they request.
 */
export function useTemplates(type: 'block' | 'page') {
  const [templates, setTemplates] = useState<Data.Template.Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchTemplates() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/templates?type=${type}`, {
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!cancelled) setTemplates(json.templates ?? [])
      } catch {
        if (!cancelled) setError('Failed to load templates')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTemplates()

    return () => {
      cancelled = true
    }
  }, [type])

  return { templates, loading, error }
}
