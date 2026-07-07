import { createHmac, timingSafeEqual } from 'node:crypto'

/** Token validity window in seconds */
const TOKEN_TTL_S = 300

/**
 * HMAC-based short-lived token helper for iframe preview access.
 *
 * Tokens encode `${pageId}:${userId}:${locale}:${expires}` and sign
 * the payload with the application's `APP_KEY`. Validation uses a
 * timing-safe comparison to prevent timing attacks.
 *
 * @example
 * const helper = new PreviewTokenHelper(env.get('APP_KEY'))
 * const token = helper.generate(page.id, user.id, 'en')
 * if (helper.validate(token, page.id, user.id, 'en')) { /* valid *\/ }
 */
export class PreviewTokenHelper {
  private readonly key: string

  /**
   * @param appKey - The application secret key used as HMAC signing secret.
   */
  constructor(appKey: string) {
    this.key = appKey
  }

  /**
   * Generates a short-lived preview token.
   *
   * @param pageId  - Page being previewed.
   * @param userId  - Authenticated editor's ID.
   * @param locale  - Locale being previewed.
   * @returns A token string in the format `${expires}.${signature}`.
   */
  generate(pageId: number, userId: number, locale: string): string {
    const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL_S
    const payload = `${pageId}:${userId}:${locale}:${expires}`
    const sig = createHmac('sha256', this.key).update(payload).digest('hex')
    return `${expires}.${sig}`
  }

  /**
   * Validates a preview token against the expected HMAC.
   *
   * Returns `false` for expired, malformed, or tampered tokens.
   * Uses timing-safe comparison to prevent timing attacks.
   *
   * @param token   - The token string to validate.
   * @param pageId  - Expected page ID.
   * @param userId  - Expected user ID.
   * @param locale  - Expected locale.
   * @returns `true` if the token is valid and not expired.
   */
  validate(token: string, pageId: number, userId: number, locale: string): boolean {
    const [expiresStr, sig] = token.split('.')
    if (!expiresStr || !sig) return false

    const expires = Number(expiresStr)
    if (Number.isNaN(expires) || Math.floor(Date.now() / 1000) > expires) return false

    const payload = `${pageId}:${userId}:${locale}:${expires}`
    const expected = createHmac('sha256', this.key).update(payload).digest('hex')

    try {
      return timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    } catch {
      return false
    }
  }
}
