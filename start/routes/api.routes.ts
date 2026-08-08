/*
|--------------------------------------------------------------------------
| REST API routes (token-guarded)
|--------------------------------------------------------------------------
|
| Versioned REST API for non-browser clients (mobile apps, scripts). These
| routes authenticate exclusively through the `api` access-token guard —
| session cookies are never consulted. Registered only when the guard is
| enabled (see `enabledAuthGuards` in `config/auth.ts`).
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import { throttle } from '#start/limiter'

export function registerApiRoutes(): void {
  router
    .group(() => {
      router
        .group(() => {
          // Same credential-stuffing budget as the session login.
          router.post('login', [controllers.auth.api.Token, 'execute']).use([throttle(5, 900)])

          router
            .group(() => {
              router.post('logout', [controllers.auth.api.Token, 'destroy'])
              router.get('me', [controllers.auth.api.Me, 'show'])
            })
            .use([middleware.auth({ guards: ['api'] })])
        })
        .prefix('auth')
        .as('auth')
    })
    .prefix('api/v1')
    .as('api.v1')
}
