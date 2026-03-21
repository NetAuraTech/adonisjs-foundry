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

        router
          .group(() => {
            router.get('/:token', [controllers.auth.front.AcceptInvitation, 'render'])
            router.post('/', [controllers.auth.front.AcceptInvitation, 'execute'])
          })
          .prefix('accept-invitation')
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
      .group(() => {
        router.get('/', [controllers.preferences.front.Preferences, 'render'])
        router.post('/', [controllers.preferences.front.Preferences, 'execute'])
      })
      .prefix('preferences')
      .use([middleware.auth()])

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

router
  .group(() => {
    router.get('/', [controllers.core.cms.Dashboard, 'render'])

    router
      .group(() => {
        router.get('/', [controllers.auth.cms.Users, 'render']).use([])

        router
          .group(() => {
            router.get('/', [controllers.auth.cms.UsersCreate, 'render']).use([])
            router.post('/', [controllers.auth.cms.UsersCreate, 'execute']).use([])
          })
          .prefix('create')

        router
          .group(() => {
            router.delete('/', [controllers.auth.cms.Users, 'destroy']).use([])
            router.get('/', [controllers.auth.cms.UsersShow, 'render']).use([])

            router
              .group(() => {
                router.get('/', [controllers.auth.cms.UsersUpdate, 'render']).use([])
                router.post('/', [controllers.auth.cms.UsersUpdate, 'execute']).use([])
              })
              .prefix('edit')
          })
          .prefix(':id')
      })
      .prefix('users')
  })
  .prefix('admin')
  .as('admin')
  .use([middleware.auth()])

router
  .group(() => {
    router
      .group(() => {
        router
          .group(() => {
            router.post('theme', [controllers.preferences.api.Theme, 'execute'])
          })
          .prefix('preferences')
      })
      .prefix('settings')
      .use([middleware.auth()])
  })
  .prefix('api')
