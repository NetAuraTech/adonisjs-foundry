/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'drive.fs.serve': {
    methods: ["GET","HEAD"],
    pattern: '/uploads/*',
    tokens: [{"old":"/uploads/*","type":0,"val":"uploads","end":""},{"old":"/uploads/*","type":2,"val":"*","end":""}],
    types: placeholder as Registry['drive.fs.serve']['types'],
  },
  'api.v1.account.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/profile',
    tokens: [{"old":"/api/v1/profile","type":0,"val":"api","end":""},{"old":"/api/v1/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['api.v1.account.profile.show']['types'],
  },
  'api.v1.account.profile.update': {
    methods: ["PUT"],
    pattern: '/api/v1/profile',
    tokens: [{"old":"/api/v1/profile","type":0,"val":"api","end":""},{"old":"/api/v1/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['api.v1.account.profile.update']['types'],
  },
  'api.v1.account.account.update': {
    methods: ["PUT"],
    pattern: '/api/v1/account',
    tokens: [{"old":"/api/v1/account","type":0,"val":"api","end":""},{"old":"/api/v1/account","type":0,"val":"v1","end":""},{"old":"/api/v1/account","type":0,"val":"account","end":""}],
    types: placeholder as Registry['api.v1.account.account.update']['types'],
  },
  'api.v1.account.account.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/account',
    tokens: [{"old":"/api/v1/account","type":0,"val":"api","end":""},{"old":"/api/v1/account","type":0,"val":"v1","end":""},{"old":"/api/v1/account","type":0,"val":"account","end":""}],
    types: placeholder as Registry['api.v1.account.account.destroy']['types'],
  },
  'api.v1.admin.account.preferences.execute': {
    methods: ["POST"],
    pattern: '/api/v1/admin/preferences/theme',
    tokens: [{"old":"/api/v1/admin/preferences/theme","type":0,"val":"api","end":""},{"old":"/api/v1/admin/preferences/theme","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/preferences/theme","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/preferences/theme","type":0,"val":"preferences","end":""},{"old":"/api/v1/admin/preferences/theme","type":0,"val":"theme","end":""}],
    types: placeholder as Registry['api.v1.admin.account.preferences.execute']['types'],
  },
  'api.v1.admin.core.dashboard.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/dashboard',
    tokens: [{"old":"/api/v1/admin/dashboard","type":0,"val":"api","end":""},{"old":"/api/v1/admin/dashboard","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/dashboard","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['api.v1.admin.core.dashboard.index']['types'],
  },
  'api.v1.admin.core.maintenance.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/maintenance',
    tokens: [{"old":"/api/v1/admin/maintenance","type":0,"val":"api","end":""},{"old":"/api/v1/admin/maintenance","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/maintenance","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/maintenance","type":0,"val":"maintenance","end":""}],
    types: placeholder as Registry['api.v1.admin.core.maintenance.index']['types'],
  },
  'api.v1.admin.core.maintenance.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/maintenance',
    tokens: [{"old":"/api/v1/admin/maintenance","type":0,"val":"api","end":""},{"old":"/api/v1/admin/maintenance","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/maintenance","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/maintenance","type":0,"val":"maintenance","end":""}],
    types: placeholder as Registry['api.v1.admin.core.maintenance.update']['types'],
  },
  'api.v1.admin.core.maintenance.toggle': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/maintenance/toggle',
    tokens: [{"old":"/api/v1/admin/maintenance/toggle","type":0,"val":"api","end":""},{"old":"/api/v1/admin/maintenance/toggle","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/maintenance/toggle","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/maintenance/toggle","type":0,"val":"maintenance","end":""},{"old":"/api/v1/admin/maintenance/toggle","type":0,"val":"toggle","end":""}],
    types: placeholder as Registry['api.v1.admin.core.maintenance.toggle']['types'],
  },
  'api.v1.admin.file.files.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/files',
    tokens: [{"old":"/api/v1/admin/files","type":0,"val":"api","end":""},{"old":"/api/v1/admin/files","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/files","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/files","type":0,"val":"files","end":""}],
    types: placeholder as Registry['api.v1.admin.file.files.index']['types'],
  },
  'api.v1.admin.file.files.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/files',
    tokens: [{"old":"/api/v1/admin/files","type":0,"val":"api","end":""},{"old":"/api/v1/admin/files","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/files","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/files","type":0,"val":"files","end":""}],
    types: placeholder as Registry['api.v1.admin.file.files.store']['types'],
  },
  'api.v1.admin.file.files.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/files/:id',
    tokens: [{"old":"/api/v1/admin/files/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/files/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/files/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/files/:id","type":0,"val":"files","end":""},{"old":"/api/v1/admin/files/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.v1.admin.file.files.show']['types'],
  },
  'api.v1.admin.file.files.move': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/files/:id/move',
    tokens: [{"old":"/api/v1/admin/files/:id/move","type":0,"val":"api","end":""},{"old":"/api/v1/admin/files/:id/move","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/files/:id/move","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/files/:id/move","type":0,"val":"files","end":""},{"old":"/api/v1/admin/files/:id/move","type":1,"val":"id","end":""},{"old":"/api/v1/admin/files/:id/move","type":0,"val":"move","end":""}],
    types: placeholder as Registry['api.v1.admin.file.files.move']['types'],
  },
  'api.v1.admin.file.files.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/files/:id',
    tokens: [{"old":"/api/v1/admin/files/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/files/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/files/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/files/:id","type":0,"val":"files","end":""},{"old":"/api/v1/admin/files/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.v1.admin.file.files.destroy']['types'],
  },
  'api.v1.admin.file.files.upsert_alt': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/files/:id/alt',
    tokens: [{"old":"/api/v1/admin/files/:id/alt","type":0,"val":"api","end":""},{"old":"/api/v1/admin/files/:id/alt","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/files/:id/alt","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/files/:id/alt","type":0,"val":"files","end":""},{"old":"/api/v1/admin/files/:id/alt","type":1,"val":"id","end":""},{"old":"/api/v1/admin/files/:id/alt","type":0,"val":"alt","end":""}],
    types: placeholder as Registry['api.v1.admin.file.files.upsert_alt']['types'],
  },
  'api.v1.admin.file.files.delete_alt': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/files/:id/alt',
    tokens: [{"old":"/api/v1/admin/files/:id/alt","type":0,"val":"api","end":""},{"old":"/api/v1/admin/files/:id/alt","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/files/:id/alt","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/files/:id/alt","type":0,"val":"files","end":""},{"old":"/api/v1/admin/files/:id/alt","type":1,"val":"id","end":""},{"old":"/api/v1/admin/files/:id/alt","type":0,"val":"alt","end":""}],
    types: placeholder as Registry['api.v1.admin.file.files.delete_alt']['types'],
  },
  'api.v1.admin.file.folders.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/folders',
    tokens: [{"old":"/api/v1/admin/folders","type":0,"val":"api","end":""},{"old":"/api/v1/admin/folders","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/folders","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/folders","type":0,"val":"folders","end":""}],
    types: placeholder as Registry['api.v1.admin.file.folders.index']['types'],
  },
  'api.v1.admin.file.folders.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/folders',
    tokens: [{"old":"/api/v1/admin/folders","type":0,"val":"api","end":""},{"old":"/api/v1/admin/folders","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/folders","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/folders","type":0,"val":"folders","end":""}],
    types: placeholder as Registry['api.v1.admin.file.folders.store']['types'],
  },
  'api.v1.admin.file.folders.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/folders/:id',
    tokens: [{"old":"/api/v1/admin/folders/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/folders/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/folders/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/folders/:id","type":0,"val":"folders","end":""},{"old":"/api/v1/admin/folders/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.v1.admin.file.folders.show']['types'],
  },
  'api.v1.admin.file.folders.children': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/folders/:id/children',
    tokens: [{"old":"/api/v1/admin/folders/:id/children","type":0,"val":"api","end":""},{"old":"/api/v1/admin/folders/:id/children","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/folders/:id/children","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/folders/:id/children","type":0,"val":"folders","end":""},{"old":"/api/v1/admin/folders/:id/children","type":1,"val":"id","end":""},{"old":"/api/v1/admin/folders/:id/children","type":0,"val":"children","end":""}],
    types: placeholder as Registry['api.v1.admin.file.folders.children']['types'],
  },
  'api.v1.admin.file.folders.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/folders/:id',
    tokens: [{"old":"/api/v1/admin/folders/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/folders/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/folders/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/folders/:id","type":0,"val":"folders","end":""},{"old":"/api/v1/admin/folders/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.v1.admin.file.folders.update']['types'],
  },
  'api.v1.admin.file.folders.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/folders/:id',
    tokens: [{"old":"/api/v1/admin/folders/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/folders/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/folders/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/folders/:id","type":0,"val":"folders","end":""},{"old":"/api/v1/admin/folders/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.v1.admin.file.folders.destroy']['types'],
  },
  'api.v1.admin.identity.users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/users',
    tokens: [{"old":"/api/v1/admin/users","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['api.v1.admin.identity.users.index']['types'],
  },
  'api.v1.admin.identity.users.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/users',
    tokens: [{"old":"/api/v1/admin/users","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['api.v1.admin.identity.users.store']['types'],
  },
  'api.v1.admin.identity.users.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/users/:id',
    tokens: [{"old":"/api/v1/admin/users/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.v1.admin.identity.users.show']['types'],
  },
  'api.v1.admin.identity.users.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/users/:id',
    tokens: [{"old":"/api/v1/admin/users/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.v1.admin.identity.users.update']['types'],
  },
  'api.v1.admin.identity.users.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/users/:id',
    tokens: [{"old":"/api/v1/admin/users/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.v1.admin.identity.users.destroy']['types'],
  },
  'api.v1.admin.identity.roles.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/roles',
    tokens: [{"old":"/api/v1/admin/roles","type":0,"val":"api","end":""},{"old":"/api/v1/admin/roles","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/roles","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/roles","type":0,"val":"roles","end":""}],
    types: placeholder as Registry['api.v1.admin.identity.roles.index']['types'],
  },
  'api.v1.admin.identity.roles.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/roles',
    tokens: [{"old":"/api/v1/admin/roles","type":0,"val":"api","end":""},{"old":"/api/v1/admin/roles","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/roles","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/roles","type":0,"val":"roles","end":""}],
    types: placeholder as Registry['api.v1.admin.identity.roles.store']['types'],
  },
  'api.v1.admin.identity.roles.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/roles/:id',
    tokens: [{"old":"/api/v1/admin/roles/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"roles","end":""},{"old":"/api/v1/admin/roles/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.v1.admin.identity.roles.show']['types'],
  },
  'api.v1.admin.identity.roles.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/roles/:id',
    tokens: [{"old":"/api/v1/admin/roles/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"roles","end":""},{"old":"/api/v1/admin/roles/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.v1.admin.identity.roles.update']['types'],
  },
  'api.v1.admin.identity.roles.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/roles/:id',
    tokens: [{"old":"/api/v1/admin/roles/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"roles","end":""},{"old":"/api/v1/admin/roles/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.v1.admin.identity.roles.destroy']['types'],
  },
  'api.v1.admin.identity.permissions.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/permissions',
    tokens: [{"old":"/api/v1/admin/permissions","type":0,"val":"api","end":""},{"old":"/api/v1/admin/permissions","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/permissions","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/permissions","type":0,"val":"permissions","end":""}],
    types: placeholder as Registry['api.v1.admin.identity.permissions.index']['types'],
  },
  'api.v1.admin.log.logs.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/logs',
    tokens: [{"old":"/api/v1/admin/logs","type":0,"val":"api","end":""},{"old":"/api/v1/admin/logs","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/logs","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/logs","type":0,"val":"logs","end":""}],
    types: placeholder as Registry['api.v1.admin.log.logs.index']['types'],
  },
  'api.v1.auth.login.execute': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['api.v1.auth.login.execute']['types'],
  },
  'api.v1.auth.register.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/register',
    tokens: [{"old":"/api/v1/auth/register","type":0,"val":"api","end":""},{"old":"/api/v1/auth/register","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/register","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['api.v1.auth.register.store']['types'],
  },
  'api.v1.auth.forgot_password.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/forgot-password',
    tokens: [{"old":"/api/v1/auth/forgot-password","type":0,"val":"api","end":""},{"old":"/api/v1/auth/forgot-password","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/forgot-password","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['api.v1.auth.forgot_password.store']['types'],
  },
  'api.v1.auth.reset_password.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/reset-password',
    tokens: [{"old":"/api/v1/auth/reset-password","type":0,"val":"api","end":""},{"old":"/api/v1/auth/reset-password","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/reset-password","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['api.v1.auth.reset_password.store']['types'],
  },
  'api.v1.auth.email_verification.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/verify-email/:token',
    tokens: [{"old":"/api/v1/auth/verify-email/:token","type":0,"val":"api","end":""},{"old":"/api/v1/auth/verify-email/:token","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/verify-email/:token","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/verify-email/:token","type":0,"val":"verify-email","end":""},{"old":"/api/v1/auth/verify-email/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['api.v1.auth.email_verification.store']['types'],
  },
  'api.v1.auth.accept_invitation.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/accept-invitation',
    tokens: [{"old":"/api/v1/auth/accept-invitation","type":0,"val":"api","end":""},{"old":"/api/v1/auth/accept-invitation","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/accept-invitation","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/accept-invitation","type":0,"val":"accept-invitation","end":""}],
    types: placeholder as Registry['api.v1.auth.accept_invitation.store']['types'],
  },
  'api.v1.auth.logout.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/auth/logout',
    tokens: [{"old":"/api/v1/auth/logout","type":0,"val":"api","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['api.v1.auth.logout.destroy']['types'],
  },
  'api.v1.auth.me.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/me',
    tokens: [{"old":"/api/v1/auth/me","type":0,"val":"api","end":""},{"old":"/api/v1/auth/me","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/me","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['api.v1.auth.me.show']['types'],
  },
  'health.liveness': {
    methods: ["GET","HEAD"],
    pattern: '/health',
    tokens: [{"old":"/health","type":0,"val":"health","end":""}],
    types: placeholder as Registry['health.liveness']['types'],
  },
  'health.readiness': {
    methods: ["GET","HEAD"],
    pattern: '/health/ready',
    tokens: [{"old":"/health/ready","type":0,"val":"health","end":""},{"old":"/health/ready","type":0,"val":"ready","end":""}],
    types: placeholder as Registry['health.readiness']['types'],
  },
  'auth.social.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/oauth/:provider',
    tokens: [{"old":"/oauth/:provider","type":0,"val":"oauth","end":""},{"old":"/oauth/:provider","type":1,"val":"provider","end":""}],
    types: placeholder as Registry['auth.social.redirect']['types'],
  },
  'auth.social.callback': {
    methods: ["GET","HEAD"],
    pattern: '/oauth/:provider/callback',
    tokens: [{"old":"/oauth/:provider/callback","type":0,"val":"oauth","end":""},{"old":"/oauth/:provider/callback","type":1,"val":"provider","end":""},{"old":"/oauth/:provider/callback","type":0,"val":"callback","end":""}],
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
