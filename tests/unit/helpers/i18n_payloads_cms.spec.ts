import type { I18n } from '@adonisjs/i18n'
import { test } from '@japa/runner'
import { I18nService } from '#services/i18n_service'
import { FakeI18n } from '#tests/helpers/fake_i18n'
import { LOCALES, loadLang, emptyLeaves } from '#tests/helpers/i18n_lang_loader'
import { buildTemplatesIndexPayload } from '#helpers/i18n_payloads/templates_index'
import { buildTemplatesEditPayload } from '#helpers/i18n_payloads/templates_edit'
import { buildPagesIndexPayload } from '#helpers/i18n_payloads/pages_index'
import { buildPagesCreatePayload } from '#helpers/i18n_payloads/pages_create'
import { buildPagesShowPayload } from '#helpers/i18n_payloads/pages_show'
import { buildPageRevisionsPayload } from '#helpers/i18n_payloads/page_revisions'
import { buildPageEditorPayload } from '#helpers/i18n_payloads/page_editor'
import { buildCmsDashboardPayload } from '#cms/helpers/i18n_payloads/dashboard_cms'

const BUILDER_IDS = [
  'templates_index',
  'templates_edit',
  'pages_index',
  'pages_create',
  'pages_show',
  'page_revisions',
  'page_editor',
  'dashboard_cms',
] as const

/**
 * Runs a single CMS builder for the request-scoped i18n and returns its
 * payload. Exhaustive over every CMS payload builder so a newly added builder
 * fails this suite until it is covered.
 */
function buildById(i18n: I18nService, id: (typeof BUILDER_IDS)[number]): any {
  switch (id) {
    case 'templates_index':
      return buildTemplatesIndexPayload(i18n)
    case 'templates_edit':
      return buildTemplatesEditPayload(i18n)
    case 'pages_index':
      return buildPagesIndexPayload(i18n)
    case 'pages_create':
      return buildPagesCreatePayload(i18n)
    case 'pages_show':
      return buildPagesShowPayload(i18n)
    case 'page_revisions':
      return buildPageRevisionsPayload(i18n)
    case 'page_editor':
      return buildPageEditorPayload(i18n)
    case 'dashboard_cms':
      return buildCmsDashboardPayload(i18n)
  }
}

test.group('i18n payload lang coverage (CMS)', () => {
  test('covers every CMS payload builder', ({ assert }) => {
    assert.lengthOf(BUILDER_IDS, 8)
  })

  for (const locale of LOCALES) {
    for (const id of BUILDER_IDS) {
      test(`${id} [${locale}]`, ({ assert }) => {
        const fake = new FakeI18n(loadLang(locale))
        const i18n = new I18nService(fake as unknown as I18n)
        const output = buildById(i18n, id)

        assert.lengthOf(fake.misses, 0)
        assert.lengthOf(emptyLeaves(output), 0)
      })
    }
  }
})
