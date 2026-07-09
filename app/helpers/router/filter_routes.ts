/**
 * Filter and shape router routes for Inertia page payloads.
 *
 * @param allRoutes - Raw route entries from `router.toJSON().root`
 * @param method - HTTP method to keep (`'GET' | 'POST'`, …)
 * @param exclusions - Prefixes / exact names to exclude
 *
 * @returns Array of `{ name, pattern, params }` suitable for the frontend
 */
export function filterRoutes(
  allRoutes: { methods: string[]; name?: string; pattern: string }[],
  method: string,
  exclusions: string[] = []
): { name: string; pattern: string; params: string[] }[] {
  return allRoutes
    .filter((r) => {
      if (!r.methods.includes(method)) return false
      if (!r.name) return false

      const isExcluded = exclusions.some((ex) => r.name.startsWith(ex))
      return !isExcluded
    })
    .map((r) => ({
      name: r.name,
      pattern: r.pattern,
      params: r.pattern.match(/:(\w+)/g)?.map((p) => p.replace(':', '')) ?? [],
    }))
}
