/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'auth.session.render': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.session.render']['types'],
  },
  'auth.session.execute': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.session.execute']['types'],
  },
  'auth.register.render': {
    methods: ["GET","HEAD"],
    pattern: '/register',
    tokens: [{"old":"/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register.render']['types'],
  },
  'auth.register.execute': {
    methods: ["POST"],
    pattern: '/register',
    tokens: [{"old":"/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register.execute']['types'],
  },
  'auth.forgot_password.render': {
    methods: ["GET","HEAD"],
    pattern: '/forgot-password',
    tokens: [{"old":"/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['auth.forgot_password.render']['types'],
  },
  'auth.forgot_password.execute': {
    methods: ["POST"],
    pattern: '/forgot-password',
    tokens: [{"old":"/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['auth.forgot_password.execute']['types'],
  },
  'auth.reset_password.render': {
    methods: ["GET","HEAD"],
    pattern: '/reset-password/:token',
    tokens: [{"old":"/reset-password/:token","type":0,"val":"reset-password","end":""},{"old":"/reset-password/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['auth.reset_password.render']['types'],
  },
  'auth.reset_password.execute': {
    methods: ["POST"],
    pattern: '/reset-password',
    tokens: [{"old":"/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['auth.reset_password.execute']['types'],
  },
  'auth.session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.session.destroy']['types'],
  },
  'auth.email_verification.execute': {
    methods: ["GET","HEAD"],
    pattern: '/verify/:token',
    tokens: [{"old":"/verify/:token","type":0,"val":"verify","end":""},{"old":"/verify/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['auth.email_verification.execute']['types'],
  },
  'auth.social.render': {
    methods: ["GET","HEAD"],
    pattern: '/oauth/define-password',
    tokens: [{"old":"/oauth/define-password","type":0,"val":"oauth","end":""},{"old":"/oauth/define-password","type":0,"val":"define-password","end":""}],
    types: placeholder as Registry['auth.social.render']['types'],
  },
  'auth.social.execute': {
    methods: ["POST"],
    pattern: '/oauth/define-password',
    tokens: [{"old":"/oauth/define-password","type":0,"val":"oauth","end":""},{"old":"/oauth/define-password","type":0,"val":"define-password","end":""}],
    types: placeholder as Registry['auth.social.execute']['types'],
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
  'auth.social.unlink': {
    methods: ["POST"],
    pattern: '/oauth/:provider/unlink',
    tokens: [{"old":"/oauth/:provider/unlink","type":0,"val":"oauth","end":""},{"old":"/oauth/:provider/unlink","type":1,"val":"provider","end":""},{"old":"/oauth/:provider/unlink","type":0,"val":"unlink","end":""}],
    types: placeholder as Registry['auth.social.unlink']['types'],
  },
  'settings.profile.render': {
    methods: ["GET","HEAD"],
    pattern: '/settings/profile',
    tokens: [{"old":"/settings/profile","type":0,"val":"settings","end":""},{"old":"/settings/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['settings.profile.render']['types'],
  },
  'settings.profile.execute': {
    methods: ["POST"],
    pattern: '/settings/profile',
    tokens: [{"old":"/settings/profile","type":0,"val":"settings","end":""},{"old":"/settings/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['settings.profile.execute']['types'],
  },
  'settings.account.render': {
    methods: ["GET","HEAD"],
    pattern: '/settings/account',
    tokens: [{"old":"/settings/account","type":0,"val":"settings","end":""},{"old":"/settings/account","type":0,"val":"account","end":""}],
    types: placeholder as Registry['settings.account.render']['types'],
  },
  'settings.account.execute': {
    methods: ["POST"],
    pattern: '/settings/account',
    tokens: [{"old":"/settings/account","type":0,"val":"settings","end":""},{"old":"/settings/account","type":0,"val":"account","end":""}],
    types: placeholder as Registry['settings.account.execute']['types'],
  },
  'settings.account.destroy': {
    methods: ["DELETE"],
    pattern: '/settings/account',
    tokens: [{"old":"/settings/account","type":0,"val":"settings","end":""},{"old":"/settings/account","type":0,"val":"account","end":""}],
    types: placeholder as Registry['settings.account.destroy']['types'],
  },
  'settings.email_change.render': {
    methods: ["GET","HEAD"],
    pattern: '/settings/account/email_change/:token',
    tokens: [{"old":"/settings/account/email_change/:token","type":0,"val":"settings","end":""},{"old":"/settings/account/email_change/:token","type":0,"val":"account","end":""},{"old":"/settings/account/email_change/:token","type":0,"val":"email_change","end":""},{"old":"/settings/account/email_change/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['settings.email_change.render']['types'],
  },
  'settings.email_change.execute': {
    methods: ["POST"],
    pattern: '/settings/account/email_change',
    tokens: [{"old":"/settings/account/email_change","type":0,"val":"settings","end":""},{"old":"/settings/account/email_change","type":0,"val":"account","end":""},{"old":"/settings/account/email_change","type":0,"val":"email_change","end":""}],
    types: placeholder as Registry['settings.email_change.execute']['types'],
  },
  'settings.index': {
    methods: ["GET","HEAD"],
    pattern: '/settings',
    tokens: [{"old":"/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['settings.index']['types'],
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
