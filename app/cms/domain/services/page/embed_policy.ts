import cmsConfig from '#config/cms'
import type { VideoProvider } from '#cms/types/page'

/**
 * Embed policy for media blocks (`video`, `iframe`).
 *
 * Pure functions deciding whether a stored URL is renderable and, for
 * videos, how it must be rendered (provider `<iframe>` embed or direct
 * `<video>` file). Called by the sanitization pipeline (save time) and by
 * `PageResolverService` (render time) so the policy is enforced at both
 * ends of the content lifecycle.
 */

export type VideoSource =
  | { kind: 'embed'; provider: VideoProvider; embedUrl: string }
  | { kind: 'file'; url: string }

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/
const VIMEO_ID_PATTERN = /^\d+$/
const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov']

/**
 * CSP `frame-src` hosts required by each provider's embed player.
 * Surfaced through `getEmbedFrameSources()` so `config/shield.ts` can keep
 * the CSP in sync with the enabled providers.
 */
const PROVIDER_EMBED_HOSTS: Record<VideoProvider, string[]> = {
  youtube: ['https://www.youtube-nocookie.com', 'https://www.youtube.com'],
  vimeo: ['https://player.vimeo.com'],
}

function parseUrl(raw: string): URL | null {
  try {
    return new URL(raw)
  } catch {
    return null
  }
}

function isLocalhostHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

function extractYouTubeId(url: URL): string | null {
  const host = url.hostname.toLowerCase()

  if (host === 'youtu.be') {
    const id = url.pathname.split('/')[1] ?? ''
    return YOUTUBE_ID_PATTERN.test(id) ? id : null
  }

  if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
    if (url.pathname === '/watch') {
      const id = url.searchParams.get('v') ?? ''
      return YOUTUBE_ID_PATTERN.test(id) ? id : null
    }
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments[0] === 'embed' || segments[0] === 'shorts') {
      const id = segments[1] ?? ''
      return YOUTUBE_ID_PATTERN.test(id) ? id : null
    }
  }

  return null
}

function extractVimeoId(url: URL): string | null {
  const host = url.hostname.toLowerCase()
  const segments = url.pathname.split('/').filter(Boolean)

  if (host === 'player.vimeo.com' && segments[0] === 'video') {
    const id = segments[1] ?? ''
    return VIMEO_ID_PATTERN.test(id) ? id : null
  }

  if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) {
    const id = segments[0] ?? ''
    return VIMEO_ID_PATTERN.test(id) ? id : null
  }

  return null
}

function hasDirectVideoExtension(pathname: string): boolean {
  const lower = pathname.toLowerCase()
  return DIRECT_VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

/**
 * Classifies a video block URL into a renderable source.
 *
 * Returns `{ kind: 'embed' }` for provider page URLs (the provider must be
 * enabled in `CMS_VIDEO_PROVIDERS`), `{ kind: 'file' }` for direct media
 * files (`.mp4`/`.webm`/`.ogg`/`.mov`), and `null` for anything else —
 * unknown providers, unsupported formats, non-HTTP(S) URLs, or `http` URLs
 * outside localhost. A `null` return means "do not render".
 *
 * @param raw - The URL stored in the block props.
 * @param providers - Enabled providers, defaults to `cmsConfig.videoProviders`.
 * @returns The renderable source, or `null` when the URL is not renderable.
 *
 * @example
 * classifyVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
 * // { kind: 'embed', provider: 'youtube', embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' }
 * classifyVideoUrl('https://vimeo.com/76979871', ['youtube'])
 * // null — vimeo not enabled
 */
export function classifyVideoUrl(
  raw: string,
  providers: readonly VideoProvider[] = cmsConfig.videoProviders
): VideoSource | null {
  // Same-origin relative URLs are only ever direct files.
  if (raw.startsWith('/')) {
    return hasDirectVideoExtension(raw) ? { kind: 'file', url: raw } : null
  }

  const url = parseUrl(raw)
  if (!url) return null
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLocalhostHost(url.hostname))) {
    return null
  }

  if (providers.includes('youtube')) {
    const id = extractYouTubeId(url)
    if (id) {
      return {
        kind: 'embed',
        provider: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      }
    }
  }

  if (providers.includes('vimeo')) {
    const id = extractVimeoId(url)
    if (id) {
      return { kind: 'embed', provider: 'vimeo', embedUrl: `https://player.vimeo.com/video/${id}` }
    }
  }

  if (hasDirectVideoExtension(url.pathname)) {
    return { kind: 'file', url: raw }
  }

  return null
}

/**
 * Checks an iframe block URL against the configured hostname allowlist.
 *
 * The URL must use `https` (`http` is accepted on localhost for
 * development) and its hostname must match an allowlist entry exactly or
 * as a subdomain of it (`www.example.com` allows `maps.example.com` but
 * not `notexample.com`). Relative URLs are never allowed.
 *
 * @param raw - The URL stored in the block props.
 * @param allowlist - Allowed hostnames, defaults to `cmsConfig.iframeAllowlist`.
 * @returns `true` when the URL may be embedded, `false` otherwise.
 *
 * @example
 * isAllowedIframeUrl('https://maps.example.com/embed', ['example.com']) // true
 * isAllowedIframeUrl('https://example.com.evil.com', ['example.com']) // false
 */
export function isAllowedIframeUrl(
  raw: string,
  allowlist: readonly string[] = cmsConfig.iframeAllowlist
): boolean {
  const url = parseUrl(raw)
  if (!url) return false
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLocalhostHost(url.hostname))) {
    return false
  }

  const hostname = url.hostname.toLowerCase()
  return allowlist.some((entry) => {
    const allowed = entry.trim().toLowerCase()
    return allowed !== '' && (hostname === allowed || hostname.endsWith(`.${allowed}`))
  })
}

/**
 * Lists the CSP `frame-src` sources needed by the enabled video providers'
 * embed players. Used by `config/shield.ts` to keep the CSP in sync with
 * `CMS_VIDEO_PROVIDERS`.
 *
 * @param providers - Enabled providers, defaults to `cmsConfig.videoProviders`.
 * @returns Fully-qualified origins (e.g. `https://player.vimeo.com`).
 */
export function getEmbedFrameSources(
  providers: readonly VideoProvider[] = cmsConfig.videoProviders
): string[] {
  return providers.flatMap((provider) => PROVIDER_EMBED_HOSTS[provider] ?? [])
}
