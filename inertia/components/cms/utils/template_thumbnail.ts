import { toPng } from 'html-to-image'

const CAPTURE_WIDTH = 1024

interface CaptureOptions {
  templateId: number
  locale?: string
  csrfToken: string
}

interface ThumbnailResult {
  fileId: number
}

/**
 * Captures a Template thumbnail from the token-protected preview route and
 * uploads the PNG through the existing File upload endpoint.
 *
 * Flow:
 * 1. Request a short-lived HMAC preview token for the Template.
 * 2. Open `/admin/templates/preview/:id` in a hidden same-origin iframe (SSR
 *    rendered through the exact same `PageResolverService` + `PageRenderer`
 *    pipeline as pages, so the image is byte-for-byte the real render).
 * 3. Wait for fonts and images to settle, then rasterise the preview container
 *    with `html-to-image` (browser-painted, so Tailwind v4 `oklch()` colors are
 *    handled — `html2canvas` cannot parse them).
 * 4. Upload the resulting PNG via `POST /api/v1/admin/files` and return the
 *    new File id for the caller to store as `thumbnailId`.
 */
export async function captureTemplateThumbnail(options: CaptureOptions): Promise<ThumbnailResult> {
  const { templateId, csrfToken, locale = 'en' } = options

  const tokenRes = await fetch(
    `/api/v1/admin/templates/preview/token?id=${templateId}&locale=${locale}`,
    { headers: { Accept: 'application/json' } }
  )
  if (!tokenRes.ok) throw new Error('Failed to request template preview token')

  const { token } = await tokenRes.json()

  const iframe = document.createElement('iframe')
  iframe.style.width = `${CAPTURE_WIDTH}px`
  iframe.style.height = '1px'
  iframe.style.position = 'fixed'
  iframe.style.left = '-99999px'
  iframe.style.top = '0'
  iframe.style.border = 'none'
  iframe.style.visibility = 'hidden'
  iframe.src = `/admin/templates/preview/${templateId}?locale=${locale}&token=${token}`
  document.body.appendChild(iframe)

  try {
    await waitForIframe(iframe)
    const doc = iframe.contentDocument
    if (!doc) throw new Error('Template preview iframe is not accessible')

    await waitForRender(doc)

    const target = doc.querySelector<HTMLElement>('[data-template-preview]') ?? doc.body

    const dataUrl = await toPng(target, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    })

    const dataUrlResponse = await fetch(dataUrl)
    const blob = await dataUrlResponse.blob()

    const form = new FormData()
    form.append('file', blob, `template-${templateId}.png`)

    const uploadRes = await fetch('/api/v1/admin/files', {
      method: 'POST',
      body: form,
      headers: { 'Accept': 'application/json', 'X-CSRF-Token': csrfToken },
    })

    if (!uploadRes.ok) throw new Error('Failed to upload template thumbnail')

    const data = await uploadRes.json()
    return { fileId: data.data?.id }
  } finally {
    iframe.remove()
  }
}

function waitForIframe(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Template preview iframe timed out')), 30000)

    const onLoad = () => {
      clearTimeout(timer)
      iframe.removeEventListener('load', onLoad)
      resolve()
    }
    const onError = () => {
      clearTimeout(timer)
      reject(new Error('Template preview iframe failed to load'))
    }

    iframe.addEventListener('load', onLoad)
    iframe.addEventListener('error', onError)
  })
}

/**
 * Waits for document fonts and every image (including lazy `<img>` tags inside
 * the SSR'd content) to settle so the capture is not blank or half-painted.
 */
async function waitForRender(doc: Document): Promise<void> {
  const images = Array.from(doc.images).filter((img) => !img.complete)
  if (images.length) {
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            const done = () => resolve()
            img.addEventListener('load', done, { once: true })
            img.addEventListener('error', done, { once: true })
            setTimeout(done, 5000)
          })
      )
    )
  }

  if (doc.fonts?.ready) {
    await Promise.race([doc.fonts.ready, new Promise((resolve) => setTimeout(resolve, 5000))])
  }
}
