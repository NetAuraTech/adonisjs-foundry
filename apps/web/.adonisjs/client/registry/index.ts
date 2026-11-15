/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'drive.fs.serve': {
    methods: ["GET","HEAD"],
    pattern: '/uploads/*',
    tokens: [[0,"uploads"],[2,"*"]],
    types: placeholder as Registry['drive.fs.serve']['types'],
  },
  'api.v1.auth.login.execute': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"login"]],
    types: placeholder as Registry['api.v1.auth.login.execute']['types'],
  },
  'api.v1.auth.register.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/register',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"register"]],
    types: placeholder as Registry['api.v1.auth.register.store']['types'],
  },
  'api.v1.auth.forgot_password.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/forgot-password',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"forgot-password"]],
    types: placeholder as Registry['api.v1.auth.forgot_password.store']['types'],
  },
  'api.v1.auth.reset_password.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/reset-password',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"reset-password"]],
    types: placeholder as Registry['api.v1.auth.reset_password.store']['types'],
  },
  'api.v1.auth.email_verification.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/verify-email/:token',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"verify-email"],[1,"token"]],
    types: placeholder as Registry['api.v1.auth.email_verification.store']['types'],
  },
  'api.v1.auth.accept_invitation.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/accept-invitation',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"accept-invitation"]],
    types: placeholder as Registry['api.v1.auth.accept_invitation.store']['types'],
  },
  'api.v1.auth.logout.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/auth/logout',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"logout"]],
    types: placeholder as Registry['api.v1.auth.logout.destroy']['types'],
  },
  'api.v1.auth.me.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/me',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"me"]],
    types: placeholder as Registry['api.v1.auth.me.show']['types'],
  },
  'api.v1.account.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/profile',
    tokens: [[0,"api"],[0,"v1"],[0,"profile"]],
    types: placeholder as Registry['api.v1.account.profile.show']['types'],
  },
  'api.v1.account.profile.update': {
    methods: ["PUT"],
    pattern: '/api/v1/profile',
    tokens: [[0,"api"],[0,"v1"],[0,"profile"]],
    types: placeholder as Registry['api.v1.account.profile.update']['types'],
  },
  'api.v1.account.account.update': {
    methods: ["PUT"],
    pattern: '/api/v1/account',
    tokens: [[0,"api"],[0,"v1"],[0,"account"]],
    types: placeholder as Registry['api.v1.account.account.update']['types'],
  },
  'api.v1.account.account.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/account',
    tokens: [[0,"api"],[0,"v1"],[0,"account"]],
    types: placeholder as Registry['api.v1.account.account.destroy']['types'],
  },
  'api.v1.admin.account.preferences.execute': {
    methods: ["POST"],
    pattern: '/api/v1/admin/preferences/theme',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"preferences"],[0,"theme"]],
    types: placeholder as Registry['api.v1.admin.account.preferences.execute']['types'],
  },
  'api.v1.admin.core.dashboard.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/dashboard',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"dashboard"]],
    types: placeholder as Registry['api.v1.admin.core.dashboard.index']['types'],
  },
  'api.v1.admin.core.maintenance.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/maintenance',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"maintenance"]],
    types: placeholder as Registry['api.v1.admin.core.maintenance.index']['types'],
  },
  'api.v1.admin.core.maintenance.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/maintenance',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"maintenance"]],
    types: placeholder as Registry['api.v1.admin.core.maintenance.update']['types'],
  },
  'api.v1.admin.core.maintenance.toggle': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/maintenance/toggle',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"maintenance"],[0,"toggle"]],
    types: placeholder as Registry['api.v1.admin.core.maintenance.toggle']['types'],
  },
  'core.openapi.spec': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/openapi.json',
    tokens: [[0,"api"],[0,"v1"],[0,"openapi.json"]],
    types: placeholder as Registry['core.openapi.spec']['types'],
  },
  'api.v1.admin.file.files.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/files',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"files"]],
    types: placeholder as Registry['api.v1.admin.file.files.index']['types'],
  },
  'api.v1.admin.file.files.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/files',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"files"]],
    types: placeholder as Registry['api.v1.admin.file.files.store']['types'],
  },
  'api.v1.admin.file.files.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/files/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"files"],[1,"id"]],
    types: placeholder as Registry['api.v1.admin.file.files.show']['types'],
  },
  'api.v1.admin.file.files.move': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/files/:id/move',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"files"],[1,"id"],[0,"move"]],
    types: placeholder as Registry['api.v1.admin.file.files.move']['types'],
  },
  'api.v1.admin.file.files.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/files/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"files"],[1,"id"]],
    types: placeholder as Registry['api.v1.admin.file.files.destroy']['types'],
  },
  'api.v1.admin.file.files.upsert_alt': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/files/:id/alt',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"files"],[1,"id"],[0,"alt"]],
    types: placeholder as Registry['api.v1.admin.file.files.upsert_alt']['types'],
  },
  'api.v1.admin.file.files.delete_alt': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/files/:id/alt',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"files"],[1,"id"],[0,"alt"]],
    types: placeholder as Registry['api.v1.admin.file.files.delete_alt']['types'],
  },
  'api.v1.admin.file.folders.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/folders',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"folders"]],
    types: placeholder as Registry['api.v1.admin.file.folders.index']['types'],
  },
  'api.v1.admin.file.folders.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/folders',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"folders"]],
    types: placeholder as Registry['api.v1.admin.file.folders.store']['types'],
  },
  'api.v1.admin.file.folders.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/folders/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"folders"],[1,"id"]],
    types: placeholder as Registry['api.v1.admin.file.folders.show']['types'],
  },
  'api.v1.admin.file.folders.children': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/folders/:id/children',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"folders"],[1,"id"],[0,"children"]],
    types: placeholder as Registry['api.v1.admin.file.folders.children']['types'],
  },
  'api.v1.admin.file.folders.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/folders/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"folders"],[1,"id"]],
    types: placeholder as Registry['api.v1.admin.file.folders.update']['types'],
  },
  'api.v1.admin.file.folders.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/folders/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"folders"],[1,"id"]],
    types: placeholder as Registry['api.v1.admin.file.folders.destroy']['types'],
  },
  'api.v1.admin.identity.users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/users',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"users"]],
    types: placeholder as Registry['api.v1.admin.identity.users.index']['types'],
  },
  'api.v1.admin.identity.users.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/users',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"users"]],
    types: placeholder as Registry['api.v1.admin.identity.users.store']['types'],
  },
  'api.v1.admin.identity.users.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/users/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"users"],[1,"id"]],
    types: placeholder as Registry['api.v1.admin.identity.users.show']['types'],
  },
  'api.v1.admin.identity.users.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/users/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"users"],[1,"id"]],
    types: placeholder as Registry['api.v1.admin.identity.users.update']['types'],
  },
  'api.v1.admin.identity.users.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/users/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"users"],[1,"id"]],
    types: placeholder as Registry['api.v1.admin.identity.users.destroy']['types'],
  },
  'api.v1.admin.identity.roles.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/roles',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"roles"]],
    types: placeholder as Registry['api.v1.admin.identity.roles.index']['types'],
  },
  'api.v1.admin.identity.roles.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/roles',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"roles"]],
    types: placeholder as Registry['api.v1.admin.identity.roles.store']['types'],
  },
  'api.v1.admin.identity.roles.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/roles/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"roles"],[1,"id"]],
    types: placeholder as Registry['api.v1.admin.identity.roles.show']['types'],
  },
  'api.v1.admin.identity.roles.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/roles/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"roles"],[1,"id"]],
    types: placeholder as Registry['api.v1.admin.identity.roles.update']['types'],
  },
  'api.v1.admin.identity.roles.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/roles/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"roles"],[1,"id"]],
    types: placeholder as Registry['api.v1.admin.identity.roles.destroy']['types'],
  },
  'api.v1.admin.identity.permissions.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/permissions',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"permissions"]],
    types: placeholder as Registry['api.v1.admin.identity.permissions.index']['types'],
  },
  'api.v1.admin.log.logs.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/logs',
    tokens: [[0,"api"],[0,"v1"],[0,"admin"],[0,"logs"]],
    types: placeholder as Registry['api.v1.admin.log.logs.index']['types'],
  },
  'health.liveness': {
    methods: ["GET","HEAD"],
    pattern: '/health',
    tokens: [[0,"health"]],
    types: placeholder as Registry['health.liveness']['types'],
  },
  'health.readiness': {
    methods: ["GET","HEAD"],
    pattern: '/health/ready',
    tokens: [[0,"health"],[0,"ready"]],
    types: placeholder as Registry['health.readiness']['types'],
  },
  'auth.social.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/oauth/:provider',
    tokens: [[0,"oauth"],[1,"provider"]],
    types: placeholder as Registry['auth.social.redirect']['types'],
  },
  'auth.social.callback': {
    methods: ["GET","HEAD"],
    pattern: '/oauth/:provider/callback',
    tokens: [[0,"oauth"],[1,"provider"],[0,"callback"]],
    types: placeholder as Registry['auth.social.callback']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
