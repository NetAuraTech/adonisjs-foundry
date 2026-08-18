import type { I18n } from '@adonisjs/i18n'
import { test } from '@japa/runner'
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type Role from '#models/auth/role'
import type Permission from '#models/auth/permission'
import { I18nService } from '#services/i18n_service'
import { FakeI18n } from '#tests/helpers/fake_i18n'
import { buildSessionPayload } from '#helpers/i18n_payloads/session'
import { buildSocialDefinePasswordPayload } from '#helpers/i18n_payloads/social_define_password'
import { buildForgotPasswordPayload } from '#helpers/i18n_payloads/forgot_password'
import { buildResetPasswordPayload } from '#helpers/i18n_payloads/reset_password'
import { buildRegisterPayload } from '#helpers/i18n_payloads/register'
import { buildAcceptInvitationPayload } from '#helpers/i18n_payloads/accept_invitation'
import { buildProfilePayload } from '#helpers/i18n_payloads/profile'
import { buildPreferencesPayload } from '#helpers/i18n_payloads/preferences'
import { buildAccountPayload } from '#helpers/i18n_payloads/account'
import { buildEmailChangePayload } from '#helpers/i18n_payloads/email_change'
import { buildHomePayload } from '#helpers/i18n_payloads/home'
import { buildDashboardPayload } from '#helpers/i18n_payloads/dashboard'
import { buildRolesListPayload } from '#helpers/i18n_payloads/roles_list'
import { buildRolesFormPayload } from '#helpers/i18n_payloads/roles_form'
import { buildRolesShowPayload } from '#helpers/i18n_payloads/roles_show'
import { buildPermissionsListPayload } from '#helpers/i18n_payloads/permissions_list'
import { buildPermissionsFormPayload } from '#helpers/i18n_payloads/permissions_form'
import { buildLogsListPayload } from '#helpers/i18n_payloads/logs_list'
import { buildTemplatesIndexPayload } from '#helpers/i18n_payloads/templates_index'
import { buildTemplatesEditPayload } from '#helpers/i18n_payloads/templates_edit'
import { buildPagesIndexPayload } from '#helpers/i18n_payloads/pages_index'
import { buildPagesCreatePayload } from '#helpers/i18n_payloads/pages_create'
import { buildPagesShowPayload } from '#helpers/i18n_payloads/pages_show'
import { buildPageRevisionsPayload } from '#helpers/i18n_payloads/page_revisions'
import { buildPageEditorPayload } from '#helpers/i18n_payloads/page_editor'
import { buildAdminMaintenanceIndexPayload } from '#helpers/i18n_payloads/maintenance_index'
import { buildMaintenanceIndexPayload } from '#helpers/i18n_payloads/maintenance_index'
import { buildFileFoldersPayload } from '#helpers/i18n_payloads/file_folders'
import { buildFilesIndexPayload } from '#helpers/i18n_payloads/files_index'
import { buildFilesShowPayload } from '#helpers/i18n_payloads/files_show'
import { buildUsersListPayload } from '#helpers/i18n_payloads/users_list'
import { buildUsersFormPayload } from '#helpers/i18n_payloads/users_form'
import { buildUsersShowPayload } from '#helpers/i18n_payloads/users_show'
import { buildCommonPayload } from '#helpers/i18n_payloads/common'

const LOCALES = ['en', 'fr'] as const

const LANG_DIR = resolve(process.cwd(), 'resources', 'lang')

/**
 * Recursively flattens a nested lang object into dot-notation keys. The file
 * basename is the root namespace (e.g. `admin.json` → `admin.*`). A JSON key
 * that itself contains dots is appended verbatim, matching the flat key the
 * i18n runtime uses.
 */
function flatten(
  root: string,
  obj: Record<string, any>,
  acc: Record<string, string>,
  prefix = ''
): void {
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flatten(root, value, acc, full)
    } else {
      acc[`${root}.${full}`] = String(value)
    }
  }
}

function loadLang(locale: string): Record<string, string> {
  const dir = join(LANG_DIR, locale)
  const acc: Record<string, string> = {}
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const root = file.replace(/\.json$/, '')
    const parsed = JSON.parse(readFileSync(join(dir, file), 'utf8'))
    flatten(root, parsed, acc)
  }
  return acc
}

/**
 * Collects the paths of every leaf in a payload whose value is the empty
 * string. A missing translation key falls back to the key itself, so this
 * specifically guards against keys stored as empty strings in the lang files.
 */
function emptyLeaves(root: Record<string, any>, prefix = ''): string[] {
  const out: string[] = []
  for (const [key, value] of Object.entries(root)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      out.push(...emptyLeaves(value, path))
    } else if (value === '') {
      out.push(path)
    }
  }
  return out
}

// Dummy domain records whose slugs map to keys that exist in both locales.
const DUMMY_ROLE = {
  slug: 'admin',
  name: 'roles.admin.value',
  description: 'roles.admin.description',
} as unknown as Role

const DUMMY_PERMISSION = {
  slug: 'users.view',
  name: 'permissions.users.view.value',
  description: 'permissions.users.view.description',
  category: 'permissions.category.users',
} as unknown as Permission

const BUILDER_IDS = [
  'session',
  'social_define_password',
  'forgot_password',
  'reset_password',
  'register',
  'accept_invitation',
  'profile',
  'preferences',
  'account',
  'email_change',
  'home',
  'dashboard',
  'roles_list',
  'roles_form',
  'roles_show',
  'permissions_list',
  'permissions_form',
  'logs_list',
  'templates_index',
  'templates_edit',
  'pages_index',
  'pages_create',
  'pages_show',
  'page_revisions',
  'page_editor',
  'admin_maintenance_index',
  'maintenance_index',
  'file_folders',
  'files_index',
  'files_show',
  'users_list',
  'users_form',
  'users_show',
  'common',
] as const

/**
 * Runs a single builder for the request-scoped i18n and returns its payload.
 * Exhaustive over every payload builder so a newly added builder fails this
 * suite until it is covered.
 */
function buildById(i18n: I18nService, id: (typeof BUILDER_IDS)[number]): any {
  switch (id) {
    case 'session':
      return buildSessionPayload(i18n)
    case 'social_define_password':
      return buildSocialDefinePasswordPayload(i18n)
    case 'forgot_password':
      return buildForgotPasswordPayload(i18n)
    case 'reset_password':
      return buildResetPasswordPayload(i18n)
    case 'register':
      return buildRegisterPayload(i18n)
    case 'accept_invitation':
      return buildAcceptInvitationPayload(i18n, 'user@example.com')
    case 'profile':
      return buildProfilePayload(i18n)
    case 'preferences':
      return buildPreferencesPayload(i18n)
    case 'account':
      return buildAccountPayload(i18n)
    case 'email_change':
      return buildEmailChangePayload(i18n)
    case 'home':
      return buildHomePayload(i18n)
    case 'dashboard':
      return buildDashboardPayload(i18n)
    case 'roles_list':
      return buildRolesListPayload(i18n, [DUMMY_ROLE])
    case 'roles_form':
      return buildRolesFormPayload(i18n, [DUMMY_PERMISSION])
    case 'roles_show':
      return buildRolesShowPayload(i18n, DUMMY_ROLE, [DUMMY_PERMISSION])
    case 'permissions_list':
      return buildPermissionsListPayload(i18n, [DUMMY_PERMISSION])
    case 'permissions_form':
      return buildPermissionsFormPayload(i18n)
    case 'logs_list':
      return buildLogsListPayload(i18n)
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
    case 'admin_maintenance_index':
      return buildAdminMaintenanceIndexPayload(i18n)
    case 'maintenance_index':
      return buildMaintenanceIndexPayload(i18n)
    case 'file_folders':
      return buildFileFoldersPayload(i18n)
    case 'files_index':
      return buildFilesIndexPayload(i18n)
    case 'files_show':
      return buildFilesShowPayload(i18n)
    case 'users_list':
      return buildUsersListPayload(i18n, [DUMMY_ROLE])
    case 'users_form':
      return buildUsersFormPayload(i18n, [DUMMY_ROLE])
    case 'users_show':
      return buildUsersShowPayload(i18n, DUMMY_ROLE, [DUMMY_PERMISSION])
    case 'common':
      return buildCommonPayload(i18n)
  }
}

test.group('i18n payload lang coverage', () => {
  test('covers every payload builder', ({ assert }) => {
    assert.lengthOf(BUILDER_IDS, 34)
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
