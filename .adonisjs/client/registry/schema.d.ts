/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
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
}
