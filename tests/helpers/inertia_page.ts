/**
 * Extracts the Inertia page object from the server-rendered HTML — the
 * `data-page` attribute carries the props JSON with HTML-escaped quotes.
 */
export function parseInertiaPage(html: string) {
  const match = html.match(/data-page="([^"]+)"/)
  if (!match) throw new Error('No Inertia data-page attribute in response')
  const json = match[1]
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
  return JSON.parse(json)
}
