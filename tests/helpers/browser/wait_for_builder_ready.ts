import { type Page } from '@playwright/test'

/**
 * Waits until the page builder's React tree is interactive.
 *
 * Inertia serves SSR HTML, then the client takes over with `createRoot()`
 * (see `inertia/app.tsx`). Between the SSR paint and the client render a
 * control can be visible without its handlers attached, so clicking too early
 * is a no-op. The builder's preview iframe navigates to the page preview
 * route only after the client app has mounted and run its effects, which
 * makes that response a reliable "interactive" signal.
 *
 * @param page - The Playwright page showing the builder editor.
 */
export async function waitForBuilderReady(page: Page) {
  await page
    .waitForResponse((response) => response.url().includes('/admin/pages/preview'), {
      timeout: 25000,
    })
    .catch(() => {
      // Best effort: if the preview did not load, fall through and let the
      // caller's explicit waits handle it.
    })
}
