/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home', {}).as('home')

router
  .group(() => {
    router
      .group(() => {
        router
          .group(() => {
            router.get('/', [controllers.auth.front.Session, 'render'])
            router.post('/', [controllers.auth.front.Session, 'execute'])
          })
          .prefix('login')

        router
          .group(() => {
            router.get('/', [controllers.auth.front.Register, 'render'])
            router.post('/', [controllers.auth.front.Register, 'execute'])
          })
          .prefix('register')

        router
          .group(() => {
            router.get('/', [controllers.auth.front.ForgotPassword, 'render'])
            router.post('/', [controllers.auth.front.ForgotPassword, 'execute'])
          })
          .prefix('forgot-password')

        router
          .group(() => {
            router.get('/:token', [controllers.auth.front.ResetPassword, 'render'])
            router.post('/', [controllers.auth.front.ResetPassword, 'execute'])
          })
          .prefix('reset-password')
      })
      .use([middleware.guest()])

    router.group(() => {
      router
        .group(() => {
          router.post('/', [controllers.auth.front.Session, 'destroy'])
        })
        .prefix('logout')
    })

    router
      .get('/verify/:token', [controllers.auth.front.EmailVerification, 'execute'])
      .use([middleware.auth()])

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', [controllers.auth.front.Social, 'render'])
            router.post('/', [controllers.auth.front.Social, 'execute'])
          })
          .prefix('define-password')

        router.get('/:provider', [controllers.auth.front.Social, 'redirect'])
        router.get('/:provider/callback', [controllers.auth.front.Social, 'callback'])

        router.post('/:provider/unlink', [controllers.auth.front.Social, 'unlink'])
      })
      .prefix('oauth')
  })
  .as('auth')

router
  .group(() => {
    router
      .group(() => {
        router.get('/', [controllers.profile.front.Profile, 'render'])
        router.post('/', [controllers.profile.front.Profile, 'execute'])
      })
      .prefix('profile')
      .use([middleware.auth()])

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', [controllers.account.front.Account, 'render'])
            router.post('/', [controllers.account.front.Account, 'execute'])
            router.delete('/', [controllers.account.front.Account, 'destroy'])
          })
          .use([middleware.auth()])

        router
          .group(() => {
            router.get('/:token', [controllers.account.front.EmailChange, 'render'])
            router.post('/', [controllers.account.front.EmailChange, 'execute'])
          })
          .prefix('email_change')
      })
      .prefix('account')

    router
      .get('/', function (ctx) {
        const { response } = ctx

        return response.redirect().toRoute('settings.profile.render')
      })
      .as('index')
      .use([middleware.auth()])
  })
  .prefix('settings')
  .as('settings')
