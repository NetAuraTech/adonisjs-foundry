/*
|--------------------------------------------------------------------------
| CMS admin REST API v1 routes
|--------------------------------------------------------------------------
|
| The CMS resources of the admin REST surface (`/api/v1/admin/pages`,
| `/api/v1/admin/templates`, `/api/v1/admin/builder`). A standalone route
| module (registered from `start/routes.ts` behind the `cms` feature flag)
| so flavors that prune the page/template domain can simply delete this file
| — nothing on `main` outside this file and `start/routes.ts` references it.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { permissions } from '#start/permissions'
import { controllers } from '#generated/controllers'
import { enabledAuthGuards } from '#config/auth'

/**
 * Same shared guard list as the admin REST surface: the in-repo admin UI
 * (session guard) and external API clients (access-token guard) consume the
 * same endpoints. Guards that are disabled in `config/auth.ts` never reach
 * `authenticateUsing`.
 */
const apiGuards = enabledAuthGuards.api ? (['web', 'api'] as const) : (['web'] as const)

export function registerCmsRestApiRoutes(): void {
  router
    .group(() => {
      router
        .group(() => {
          // Pages
          router
            .group(() => {
              router
                .get('/', [controllers.page.api.PagesApi, 'index'])
                .use([middleware.permission({ permissions: [permissions.pagesView] })])
              router
                .post('/', [controllers.page.api.PagesCreateApi, 'store'])
                .use([middleware.permission({ permissions: [permissions.pagesCreate] })])
              router
                .get('/:id', [controllers.page.api.PagesShowApi, 'show'])
                .use([middleware.permission({ permissions: [permissions.pagesView] })])
              router
                .put('/:id', [controllers.page.api.PagesUpdateApi, 'update'])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
              router
                .delete('/:id', [controllers.page.api.PagesDeleteApi, 'destroy'])
                .use([middleware.permission({ permissions: [permissions.pagesDelete] })])
              router
                .put('/:id/publish', [controllers.page.api.PagesUpdateApi, 'publish'])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
              router
                .put('/:id/unpublish', [controllers.page.api.PagesUpdateApi, 'unpublish'])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
              router
                .put('/:id/homepage', [controllers.page.api.PagesApi, 'setHomepage'])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
              router
                .post('/:id/translations', [controllers.page.api.PageTranslationsApi, 'store'])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
              router
                .group(() => {
                  router
                    .get('/', [controllers.page.api.PageRevisionsApi, 'index'])
                    .use([middleware.permission({ permissions: [permissions.pagesView] })])
                  router
                    .post('/:revisionId/restore', [
                      controllers.page.api.PageRevisionsApi,
                      'restore',
                    ])
                    .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
                  router
                    .put('/:revisionId/pin', [controllers.page.api.PageRevisionsApi, 'toggle'])
                    .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
                })
                .prefix('/:id/translations/:translationId/revisions')

              router
                .get('/preview/token', [controllers.page.api.PagesPreviewToken, 'token'])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
            })
            .prefix('pages')

          // Templates
          router
            .group(() => {
              router
                .get('/', [controllers.template.api.Templates, 'index'])
                .use([middleware.permission({ permissions: [permissions.templatesView] })])
              router
                .post('/', [controllers.template.api.Templates, 'store'])
                .use([middleware.permission({ permissions: [permissions.templatesCreate] })])
              router
                .put('/:id', [controllers.template.api.Templates, 'update'])
                .use([middleware.permission({ permissions: [permissions.templatesUpdate] })])
              router
                .delete('/:id', [controllers.template.api.Templates, 'destroy'])
                .use([middleware.permission({ permissions: [permissions.templatesDelete] })])
              router
                .post('/from-page', [controllers.template.api.Templates, 'createFromPage'])
                .use([middleware.permission({ permissions: [permissions.templatesCreate] })])
              router
                .get('/preview/token', [controllers.template.api.TemplatesPreviewToken, 'token'])
                .use([middleware.permission({ permissions: [permissions.templatesView] })])
            })
            .prefix('templates')

          // Builder
          router
            .group(() => {
              router
                .post('/operations', [controllers.page.api.BuilderOperations, 'execute'])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
              router
                .get('/presence/:translationId', [
                  controllers.page.api.BuilderOperations,
                  'presence',
                ])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
              router
                .post('/draft/:translationId', [
                  controllers.page.api.BuilderOperations,
                  'saveDraft',
                ])
                .use([middleware.permission({ permissions: [permissions.pagesUpdate] })])
            })
            .prefix('builder')
        })
        .prefix('admin')
        .as('admin')
        .use([middleware.auth({ guards: [...apiGuards] })])
    })
    .prefix('api/v1')
    .as('api.v1')
}
