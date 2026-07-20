import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
  /**
   * Configure CSP policies for your app. Refer documentation
   * to learn more.
   */
  csp: {
    /**
     * Enable the Content-Security-Policy header.
     */
    enabled: true,

    /**
     * Report violations without blocking resources in dev/test.
     * Enforce in production.
     */
    reportOnly: app.inDev || app.inTest,

    /**
     * Per-resource CSP directives.
     */
    directives: {
      // Default: only same-origin
      defaultSrc: ["'self'"],

      // Scripts: self + Vite HMR in dev/test
      scriptSrc: [
        "'self'",
        ...(app.inDev || app.inTest ? ["'unsafe-eval'", "'unsafe-inline'"] : []), // Vite HMR needs these in dev/test
      ],

      // Styles: self + Tailwind JIT inline styles
      styleSrc: ["'self'", "'unsafe-inline'"],

      // Images: self + data: URIs + HTTPS
      imgSrc: ["'self'", 'data:', 'https:'],

      // Fonts: self + data: (for inline fonts)
      fontSrc: ["'self'", 'data:'],

      // Connect: self + SSE + Vite HMR websocket + Sentry
      connectSrc: [
        "'self'",
        ...(app.inDev || app.inTest ? ['ws:', 'wss:'] : []), // Vite HMR websocket
        'https://*.sentry.io', // Sentry error reporting
      ],

      // Frames: deny (xFrame also set to SAMEORIGIN)
      frameAncestors: ["'none'"],

      // Forms: self only
      formAction: ["'self'"],

      // Base URI: self
      baseUri: ["'self'"],

      // Object/embed: none
      objectSrc: ["'none'"],

      // Media: self
      mediaSrc: ["'self'"],

      // Workers: self
      workerSrc: ["'self'"],

      // Manifest: self
      manifestSrc: ["'self'"],
    },
  },

  /**
   * Configure CSRF protection options. Refer documentation
   * to learn more.
   */
  csrf: {
    /**
     * Enable CSRF token verification for state-changing requests.
     */
    enabled: true,

    /**
     * Route patterns to exclude from CSRF checks.
     * Useful for external webhooks or API endpoints.
     */
    exceptRoutes: [],

    /**
     * Expose an encrypted XSRF-TOKEN cookie for frontend HTTP clients.
     */
    enableXsrfCookie: true,

    /**
     * HTTP methods protected by CSRF validation.
     */
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },

  /**
   * Control how your website should be embedded inside
   * iframes.
   */
  xFrame: {
    /**
     * Enable the X-Frame-Options header.
     */
    enabled: true,

    /**
     * Block all framing attempts. Default value is DENY.
     */
    action: 'SAMEORIGIN',
  },

  /**
   * Force browser to always use HTTPS.
   */
  hsts: {
    /**
     * Enable the Strict-Transport-Security header.
     */
    enabled: true,

    /**
     * HSTS policy duration remembered by browsers.
     */
    maxAge: '180 days',
  },

  /**
   * Disable browsers from sniffing content types and rely only
   * on the response content-type header.
   */
  contentTypeSniffing: {
    /**
     * Enable X-Content-Type-Options: nosniff.
     */
    enabled: true,
  },
})

export default shieldConfig
