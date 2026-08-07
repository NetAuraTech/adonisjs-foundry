/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'drive.fs.serve': {
    methods: ["GET","HEAD"]
    pattern: '/uploads/*'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { '*': ParamValue[] }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'event_stream': {
    methods: ["GET","HEAD"]
    pattern: '/__transmit/events'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'subscribe': {
    methods: ["POST"]
    pattern: '/__transmit/subscribe'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'unsubscribe': {
    methods: ["POST"]
    pattern: '/__transmit/unsubscribe'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'health.liveness': {
    methods: ["GET","HEAD"]
    pattern: '/health'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/health/health_controller').default['liveness']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/health/health_controller').default['liveness']>>>
    }
  }
  'health.readiness': {
    methods: ["GET","HEAD"]
    pattern: '/health/ready'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/health/health_controller').default['readiness']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/health/health_controller').default['readiness']>>>
    }
  }
  'auth.session.render': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/session_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/session_controller').default['render']>>>
    }
  }
  'auth.session.execute': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/session_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/session_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.register.render': {
    methods: ["GET","HEAD"]
    pattern: '/register'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/register_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/register_controller').default['render']>>>
    }
  }
  'auth.register.execute': {
    methods: ["POST"]
    pattern: '/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').registerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').registerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/register_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/register_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.forgot_password.render': {
    methods: ["GET","HEAD"]
    pattern: '/forgot-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/forgot_password_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/forgot_password_controller').default['render']>>>
    }
  }
  'auth.forgot_password.execute': {
    methods: ["POST"]
    pattern: '/forgot-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').forgotPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').forgotPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/forgot_password_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/forgot_password_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.reset_password.render': {
    methods: ["GET","HEAD"]
    pattern: '/reset-password/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/reset_password_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/reset_password_controller').default['render']>>>
    }
  }
  'auth.reset_password.execute': {
    methods: ["POST"]
    pattern: '/reset-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').resetPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').resetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/reset_password_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/reset_password_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.accept_invitation.render': {
    methods: ["GET","HEAD"]
    pattern: '/accept-invitation/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/auth').invitationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/accept_invitation_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/accept_invitation_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.accept_invitation.execute': {
    methods: ["POST"]
    pattern: '/accept-invitation'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').invitationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').invitationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/accept_invitation_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/accept_invitation_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.session.destroy': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/session_controller').default['destroy']>>>
    }
  }
  'auth.email_verification.execute': {
    methods: ["GET","HEAD"]
    pattern: '/verify/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/email_verification_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/email_verification_controller').default['execute']>>>
    }
  }
  'auth.social.render': {
    methods: ["GET","HEAD"]
    pattern: '/oauth/define-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/social_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/social_controller').default['render']>>>
    }
  }
  'auth.social.execute': {
    methods: ["POST"]
    pattern: '/oauth/define-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').definePasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').definePasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/social_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/social_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.social.redirect': {
    methods: ["GET","HEAD"]
    pattern: '/oauth/:provider'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { provider: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/social_controller').default['redirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/social_controller').default['redirect']>>>
    }
  }
  'auth.social.callback': {
    methods: ["GET","HEAD"]
    pattern: '/oauth/:provider/callback'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { provider: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/social_controller').default['callback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/social_controller').default['callback']>>>
    }
  }
  'auth.social.unlink': {
    methods: ["POST"]
    pattern: '/oauth/:provider/unlink'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { provider: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/front/social_controller').default['unlink']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/front/social_controller').default['unlink']>>>
    }
  }
  'settings.profile.render': {
    methods: ["GET","HEAD"]
    pattern: '/settings/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile/front/profile_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile/front/profile_controller').default['render']>>>
    }
  }
  'settings.profile.execute': {
    methods: ["POST"]
    pattern: '/settings/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile/front/profile_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile/front/profile_controller').default['execute']>>>
    }
  }
  'settings.account.render': {
    methods: ["GET","HEAD"]
    pattern: '/settings/account'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account/front/account_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account/front/account_controller').default['render']>>>
    }
  }
  'settings.account.execute': {
    methods: ["POST"]
    pattern: '/settings/account'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/account').updatePasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/account').updatePasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account/front/account_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account/front/account_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.account.destroy': {
    methods: ["DELETE"]
    pattern: '/settings/account'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/account').deleteAccountValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/account').deleteAccountValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account/front/account_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account/front/account_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.email_change.render': {
    methods: ["GET","HEAD"]
    pattern: '/settings/account/email_change/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account/front/email_change_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account/front/email_change_controller').default['render']>>>
    }
  }
  'settings.email_change.execute': {
    methods: ["POST"]
    pattern: '/settings/account/email_change'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/account').changeEmailValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/account').changeEmailValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account/front/email_change_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account/front/email_change_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.preferences.render': {
    methods: ["GET","HEAD"]
    pattern: '/settings/preferences'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/preferences/front/preferences_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/preferences/front/preferences_controller').default['render']>>>
    }
  }
  'settings.preferences.execute': {
    methods: ["POST"]
    pattern: '/settings/preferences'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/preference').updateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/preference').updateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/preferences/front/preferences_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/preferences/front/preferences_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.index': {
    methods: ["GET","HEAD"]
    pattern: '/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin.dashboard.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/core/admin/dashboard_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/core/admin/dashboard_controller').default['render']>>>
    }
  }
  'admin.users.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_controller').default['render']>>>
    }
  }
  'admin.users_create.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_create_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_create_controller').default['render']>>>
    }
  }
  'admin.users_create.execute': {
    methods: ["POST"]
    pattern: '/admin/users/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_create_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_create_controller').default['execute']>>>
    }
  }
  'admin.users.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').deleteValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/user').deleteValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users_show.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/user').showValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_show_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_show_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users_update.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/user').editValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_update_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_update_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users_update.execute': {
    methods: ["POST"]
    pattern: '/admin/users/:id/edit'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').editValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/user').editValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_update_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/users_update_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.roles.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/roles'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/role').listRolesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.roles_create.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/roles/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_create_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_create_controller').default['render']>>>
    }
  }
  'admin.roles_create.execute': {
    methods: ["POST"]
    pattern: '/admin/roles/create'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/role').createRoleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/role').createRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_create_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_create_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.roles.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/roles/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/role').deleteRoleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/role').deleteRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.roles_show.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/roles/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/role').showRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_show_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_show_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.roles_update.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/roles/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/role').editRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_update_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_update_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.roles_update.execute': {
    methods: ["POST"]
    pattern: '/admin/roles/:id/edit'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/role').editRoleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/role').editRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_update_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/roles_update_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.permissions.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/permissions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/permissions_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/permissions_controller').default['render']>>>
    }
  }
  'admin.permissions_create.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/permissions/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/permissions_create_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/permissions_create_controller').default['render']>>>
    }
  }
  'admin.permissions_create.execute': {
    methods: ["POST"]
    pattern: '/admin/permissions/create'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/permission').createPermissionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/permission').createPermissionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/permissions_create_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/permissions_create_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.permissions.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/permissions/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/permission').deletePermissionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/permission').deletePermissionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/permissions_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/permissions_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.permissions_update.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/permissions/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/permission').editPermissionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/permissions_update_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/permissions_update_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.permissions_update.execute': {
    methods: ["POST"]
    pattern: '/admin/permissions/:id/edit'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/permission').editPermissionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/permission').editPermissionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/admin/permissions_update_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/admin/permissions_update_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.pages.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pages'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#cms/validators/page').listPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.pages_create.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pages/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_create_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_create_controller').default['render']>>>
    }
  }
  'admin.pages_create.execute': {
    methods: ["POST"]
    pattern: '/admin/pages/create'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/page').createPageValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/page').createPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_create_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_create_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.pages_show.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pages/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#cms/validators/page').showPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_show_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_show_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.pages_update.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pages/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#cms/validators/page').showPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_update_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_update_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.pages_update.execute': {
    methods: ["POST"]
    pattern: '/admin/pages/:id/edit'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/page').showPageValidator)>|InferInput<(typeof import('#cms/validators/page').updatePageValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/page').showPageValidator)>|InferInput<(typeof import('#cms/validators/page').updatePageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_update_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_update_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.pages_update.publish': {
    methods: ["POST"]
    pattern: '/admin/pages/:id/publish'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/page').showPageValidator)>|InferInput<(typeof import('#cms/validators/page').publishPageValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/page').showPageValidator)>|InferInput<(typeof import('#cms/validators/page').publishPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_update_controller').default['publish']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_update_controller').default['publish']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.pages_update.unpublish': {
    methods: ["POST"]
    pattern: '/admin/pages/:id/unpublish'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/page').showPageValidator)>|InferInput<(typeof import('#cms/validators/page').publishPageValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/page').showPageValidator)>|InferInput<(typeof import('#cms/validators/page').publishPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_update_controller').default['unpublish']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_update_controller').default['unpublish']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.pages.set_homepage': {
    methods: ["POST"]
    pattern: '/admin/pages/:id/homepage'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_controller').default['setHomepage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_controller').default['setHomepage']>>>
    }
  }
  'admin.pages.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/pages/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/page').showPageValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/page').showPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.page_translations.execute': {
    methods: ["POST"]
    pattern: '/admin/pages/:id/translations'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/page').showPageValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/page').showPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/page_translations_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/page_translations_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.page_revisions.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pages/:id/translations/:translationId/revisions'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; translationId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/page_revisions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/page_revisions_controller').default['index']>>>
    }
  }
  'admin.page_revisions.restore': {
    methods: ["POST"]
    pattern: '/admin/pages/:id/translations/:translationId/revisions/:revisionId/restore'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/page').revisionValidator)>>
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { id: ParamValue; translationId: ParamValue; revisionId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/page').revisionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/page_revisions_controller').default['restore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/page_revisions_controller').default['restore']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.page_revisions.toggle_keep': {
    methods: ["POST"]
    pattern: '/admin/pages/:id/translations/:translationId/revisions/:revisionId/keep'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/page').revisionValidator)>>
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { id: ParamValue; translationId: ParamValue; revisionId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/page').revisionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/page_revisions_controller').default['toggleKeep']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/page_revisions_controller').default['toggleKeep']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.pages_preview.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pages/preview/:pageId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { pageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_preview_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_preview_controller').default['render']>>>
    }
  }
  'admin.templates.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/templates'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#cms/validators/template').listTemplateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.templates.execute': {
    methods: ["POST"]
    pattern: '/admin/templates'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/template').createTemplateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/template').createTemplateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.templates.apply_to_page': {
    methods: ["POST"]
    pattern: '/admin/templates/:id/apply'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/template').showTemplateValidator)>|InferInput<(typeof import('#cms/validators/template').applyTemplateValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/template').showTemplateValidator)>|InferInput<(typeof import('#cms/validators/template').applyTemplateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_controller').default['applyToPage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_controller').default['applyToPage']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.templates.update': {
    methods: ["POST"]
    pattern: '/admin/templates/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/template').showTemplateValidator)>|InferInput<(typeof import('#cms/validators/template').updateTemplateValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/template').showTemplateValidator)>|InferInput<(typeof import('#cms/validators/template').updateTemplateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.templates.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/templates/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/template').showTemplateValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/template').showTemplateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.templates_preview.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/templates/preview/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#cms/validators/template').templatePreviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_preview_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_preview_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.templates.edit': {
    methods: ["GET","HEAD"]
    pattern: '/admin/templates/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#cms/validators/template').showTemplateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_controller').default['edit']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.files.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/files'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/file').listFileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file/admin/files_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file/admin/files_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.files.upload': {
    methods: ["POST"]
    pattern: '/admin/files/upload'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file/admin/files_controller').default['upload']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file/admin/files_controller').default['upload']>>>
    }
  }
  'admin.files.move': {
    methods: ["POST"]
    pattern: '/admin/files/:id/move'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/file').showFileValidator)>|InferInput<(typeof import('#validators/file').moveFileValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/file').showFileValidator)>|InferInput<(typeof import('#validators/file').moveFileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file/admin/files_controller').default['move']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file/admin/files_controller').default['move']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.files.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/files/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/file').showFileValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/file').showFileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file/admin/files_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file/admin/files_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.files.upsert_alt': {
    methods: ["POST"]
    pattern: '/admin/files/:id/alts'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/file').showFileValidator)>|InferInput<(typeof import('#validators/file').upsertAltValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/file').showFileValidator)>|InferInput<(typeof import('#validators/file').upsertAltValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file/admin/files_controller').default['upsertAlt']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file/admin/files_controller').default['upsertAlt']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.files.delete_alt': {
    methods: ["DELETE"]
    pattern: '/admin/files/:id/alts'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/file').showFileValidator)>|InferInput<(typeof import('#validators/file').deleteAltValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/file').showFileValidator)>|InferInput<(typeof import('#validators/file').deleteAltValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file/admin/files_controller').default['deleteAlt']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file/admin/files_controller').default['deleteAlt']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.file_folders.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/files/folders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file/admin/file_folders_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file/admin/file_folders_controller').default['render']>>>
    }
  }
  'admin.file_folders.execute': {
    methods: ["POST"]
    pattern: '/admin/files/folders'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/file').createFolderValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/file').createFolderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file/admin/file_folders_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file/admin/file_folders_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.file_folders.update': {
    methods: ["PUT"]
    pattern: '/admin/files/folders/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/file').showFileValidator)>|InferInput<(typeof import('#validators/file').updateFolderValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/file').showFileValidator)>|InferInput<(typeof import('#validators/file').updateFolderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file/admin/file_folders_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file/admin/file_folders_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.file_folders.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/files/folders/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/file').showFileValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/file').showFileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file/admin/file_folders_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file/admin/file_folders_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.settings.maintenance.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/settings/maintenance'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/maintenance/admin/maintenance_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/maintenance/admin/maintenance_controller').default['render']>>>
    }
  }
  'admin.settings.maintenance.update': {
    methods: ["POST"]
    pattern: '/admin/settings/maintenance'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/maintenance/admin/maintenance_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/maintenance/admin/maintenance_controller').default['update']>>>
    }
  }
  'admin.settings.maintenance.toggle': {
    methods: ["POST"]
    pattern: '/admin/settings/maintenance/toggle'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/maintenance/admin/maintenance_controller').default['toggle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/maintenance/admin/maintenance_controller').default['toggle']>>>
    }
  }
  'admin.logs.render': {
    methods: ["GET","HEAD"]
    pattern: '/admin/logs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/log').listLogsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/log/admin/logs_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/log/admin/logs_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.theme.execute': {
    methods: ["POST"]
    pattern: '/api/settings/preferences/theme'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/preference').updateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/preference').updateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/preferences/api/theme_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/preferences/api/theme_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.admin.builder_operations.execute': {
    methods: ["POST"]
    pattern: '/api/admin/builder/operations'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/builder').builderOperationValidator)>|InferInput<(typeof import('@vinejs/vine').default)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/builder').builderOperationValidator)>|InferInput<(typeof import('@vinejs/vine').default)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/api/builder_operations_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/api/builder_operations_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.admin.builder_operations.presence': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/builder/presence/:translationId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { translationId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#cms/validators/builder').builderPresenceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/api/builder_operations_controller').default['presence']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/api/builder_operations_controller').default['presence']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.admin.builder_operations.save_draft': {
    methods: ["POST"]
    pattern: '/api/admin/builder/draft/:translationId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { translationId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/api/builder_operations_controller').default['saveDraft']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/api/builder_operations_controller').default['saveDraft']>>>
    }
  }
  'api.admin.pages_preview.token': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/page/preview/token'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_preview_controller').default['token']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/admin/pages_preview_controller').default['token']>>>
    }
  }
  'api.admin.templates.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/templates'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#cms/validators/template').listTemplateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/template/api/templates_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/template/api/templates_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.admin.templates.store': {
    methods: ["POST"]
    pattern: '/api/admin/templates'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/template').createBlockTemplateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/template').createBlockTemplateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/template/api/templates_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/template/api/templates_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.admin.templates.update': {
    methods: ["PUT"]
    pattern: '/api/admin/templates/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/template').updateTemplateValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/template').updateTemplateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/template/api/templates_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/template/api/templates_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.admin.templates.create_from_page': {
    methods: ["POST"]
    pattern: '/api/admin/templates/from-page'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/template').createFromPageValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/template').createFromPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/template/api/templates_controller').default['createFromPage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/template/api/templates_controller').default['createFromPage']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.admin.templates_preview.token': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/templates/preview/token'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_preview_controller').default['token']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/template/admin/templates_preview_controller').default['token']>>>
    }
  }
  'api.admin.file.list': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/files'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file/api/file_controller').default['list']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file/api/file_controller').default['list']>>>
    }
  }
  'api.admin.file.find': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/files/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file/api/file_controller').default['find']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file/api/file_controller').default['find']>>>
    }
  }
  'api.admin.file.upload': {
    methods: ["POST"]
    pattern: '/api/admin/files/upload'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file/api/file_controller').default['upload']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file/api/file_controller').default['upload']>>>
    }
  }
  'contact.execute': {
    methods: ["POST"]
    pattern: '/contact'
    types: {
      body: ExtractBody<InferInput<(typeof import('#cms/validators/contact').contactValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#cms/validators/contact').contactValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/front/contact_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/front/contact_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'page.sitemap': {
    methods: ["GET","HEAD"]
    pattern: '/sitemap.xml'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/front/page_controller').default['sitemap']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/front/page_controller').default['sitemap']>>>
    }
  }
  'page.robots': {
    methods: ["GET","HEAD"]
    pattern: '/robots.txt'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/front/page_controller').default['robots']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/front/page_controller').default['robots']>>>
    }
  }
  'page.home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/front/page_controller').default['home']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/front/page_controller').default['home']>>>
    }
  }
  'page.localised.render': {
    methods: ["GET","HEAD"]
    pattern: '/:locale/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { locale: ParamValue; slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/front/page_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/front/page_controller').default['render']>>>
    }
  }
  'page.render': {
    methods: ["GET","HEAD"]
    pattern: '/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/page/front/page_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/page/front/page_controller').default['render']>>>
    }
  }
}
