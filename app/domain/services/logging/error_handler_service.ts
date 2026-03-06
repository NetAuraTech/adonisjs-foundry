import { HttpContext } from '@adonisjs/core/http'
import { Sentry } from '@rlanz/sentry'
import { inject } from '@adonisjs/core'
import { CustomErrorHandler, LogCategory } from '#types/logging'
import { RoutesList } from '@adonisjs/core/types/http'
import { LogService } from '#services/logging/log_service'
import ProviderNotConfiguredException from '#exceptions/auth/provider_not_configured_exception'
import ProviderAlreadyLinkedException from '#exceptions/auth/provider_already_linked_exception'
import UnverifiedAccountException from '#exceptions/auth/unverified_account_exception'

type RouteName = keyof RoutesList['GET']

/**
 * Centralised error handling service for both Web and API contexts.
 *
 * Provides two public entry points:
 * - {@link handle} for Web requests — redirects with flash messages.
 * - {@link handleApi} for API requests — returns structured JSON responses.
 *
 * Both methods share the same error classification pipeline:
 * 1. Validation errors are handled first.
 * 2. Custom caller-provided handlers are evaluated via {@link findMatchingHandler}.
 * 3. Known application errors are resolved via {@link handleCommonErrors}.
 * 4. Unrecognised errors are logged, reported to Sentry, and returned as generic failures.
 */
@inject()
export class ErrorHandlerService {
  constructor(protected logService: LogService) {}

  /**
   * Handles an error for a **Web** request.
   *
   * Validation errors are re-thrown so AdonisJS can handle them natively.
   * All other errors are resolved to a user-facing message and trigger a
   * redirect — either to a specific route (when defined) or back to the
   * previous page.
   *
   * @param ctx - The current AdonisJS HTTP context.
   * @param error - The error to handle.
   * @param customHandlers - Optional list of caller-defined handlers evaluated
   *   before the built-in error map. Each entry can provide a callback, a
   *   static message, or both.
   * @returns A redirect response.
   *
   * @example
   * return this.errorHandlerService.handle(ctx, error, [
   *   { code: 'E_CUSTOM', message: t('errors.custom') },
   * ])
   */
  async handle(
    ctx: HttpContext,
    error: any,
    customHandlers: CustomErrorHandler[] = []
  ): Promise<any> {
    const { session, response, i18n } = ctx

    if (error.code === 'E_VALIDATION_ERROR') {
      throw error
    }

    if (error.retryAfter) {
      response.header('Retry-After', error.retryAfter.toString())
    }

    const customHandler = this.findMatchingHandler(error, customHandlers)
    if (customHandler) {
      if (customHandler.callback) {
        return customHandler.callback(ctx)
      }
      const message = customHandler.message || i18n.t('common.unexpected_error')
      session.flash('error', message)
      return response.redirect().back()
    }

    const commonError = this.handleCommonErrors(error, i18n)
    if (commonError) {
      session.flash('error', commonError.message)

      if (commonError.redirectTo) {
        return response.redirect().toRoute(commonError.redirectTo)
      }

      return response.redirect().back()
    }

    this.logError(ctx, error)
    Sentry.captureException(error)

    const errorCode = error.code || error.name || 'UNKNOWN'
    session.flash('error', i18n.t('common.unexpected_error', { code: errorCode }))
    return response.redirect().back()
  }

  /**
   * Handles an error for an **API** request.
   *
   * Validation errors return a `422` response with field-level details.
   * All other errors are resolved to a structured JSON body with `code`,
   * `message`, and optional debug fields (`stack`, `details`) in development.
   * Server errors (`5xx`) are additionally reported to Sentry.
   *
   * @param ctx - The current AdonisJS HTTP context.
   * @param error - The error to handle.
   * @param customHandlers - Optional list of caller-defined handlers evaluated
   *   before the built-in error map.
   * @returns A JSON response.
   *
   * @example
   * return this.errorHandlerService.handleApi(ctx, error)
   */
  async handleApi(
    ctx: HttpContext,
    error: any,
    customHandlers: CustomErrorHandler[] = []
  ): Promise<any> {
    const { response, i18n } = ctx

    if (error.code === 'E_VALIDATION_ERROR') {
      return response.status(422).json({
        error: {
          code: 'E_VALIDATION_ERROR',
          message: i18n.t('validation.failed'),
          details: error.messages || [],
        },
      })
    }

    if (error.retryAfter) {
      response.header('Retry-After', error.retryAfter.toString())
    }

    const customHandler = this.findMatchingHandler(error, customHandlers)
    if (customHandler) {
      if (customHandler.callback) {
        return customHandler.callback(ctx)
      }

      const status = error.status || 400
      return response.status(status).json({
        error: {
          code: error.code || 'E_CUSTOM_ERROR',
          message: customHandler.message || i18n.t('common.unexpected_error'),
        },
      })
    }

    const commonError = this.handleCommonErrors(error, i18n)
    if (commonError) {
      const responseData: any = {
        error: {
          code: commonError.code,
          message: commonError.message,
        },
      }

      if (error.code === 'E_RATE_LIMIT') {
        if (error.retryAfter) responseData.error.retryAfter = error.retryAfter
        if (error.retryMinutes) responseData.error.retryMinutes = error.retryMinutes
      }

      return response.status(commonError.status).json(responseData)
    }

    this.logError(ctx, error)

    const status = error.status || 500
    if (status >= 500) {
      Sentry.captureException(error)
    }

    return response.status(status).json({
      error: {
        code: error.code || 'E_UNKNOWN',
        message: error.message || i18n.t('common.unexpected_error'),
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          details: error.details,
        }),
      },
    })
  }

  /**
   * Finds the first caller-provided handler that matches the given error.
   *
   * Matching is attempted in order against `code`, `exception` (instanceof),
   * and `message`. Returns `null` if no handler matches.
   *
   * @param error - The error to match against.
   * @param handlers - The list of candidate handlers.
   * @returns The first matching {@link CustomErrorHandler}, or `null`.
   */
  private findMatchingHandler(
    error: any,
    handlers: CustomErrorHandler[]
  ): CustomErrorHandler | null {
    for (const handler of handlers) {
      const isMatch =
        (handler.code && error.code === handler.code) ||
        (handler.exception && error instanceof handler.exception) ||
        (handler.message && error.message === handler.message)

      if (isMatch) {
        return handler
      }
    }
    return null
  }

  /**
   * Resolves a known application error to a normalised descriptor usable
   * by both {@link handle} and {@link handleApi}.
   *
   * Known custom exceptions (`ProviderNotConfiguredException`,
   * `ProviderAlreadyLinkedException`, `UnverifiedAccountException`) are
   * matched via `instanceof` for type safety. Generic error codes are
   * resolved through a static map. Raw `401`/`403` statuses without a
   * recognised code are handled as a fallback.
   *
   * @param error - The error to classify.
   * @param i18n - The AdonisJS i18n instance used to translate messages.
   * @returns A normalised error descriptor, or `null` if the error is unrecognised.
   */
  private handleCommonErrors(
    error: any,
    i18n: any
  ): { code: string; message: string; status: number; redirectTo?: RouteName } | null {
    if (error instanceof ProviderNotConfiguredException) {
      return {
        code: 'E_PROVIDER_NOT_CONFIGURED',
        message: i18n.t('auth.social.not_configured', { provider: error.provider }),
        status: ProviderNotConfiguredException.status,
      }
    }

    if (error instanceof ProviderAlreadyLinkedException) {
      return {
        code: 'E_PROVIDER_ALREADY_LINKED',
        message: i18n.t('auth.social.already_linked', { provider: error.provider }),
        status: ProviderAlreadyLinkedException.status,
      }
    }

    if (error instanceof UnverifiedAccountException) {
      return {
        code: 'E_UNVERIFIED_ACCOUNT',
        message: i18n.t('auth.verify_email.required'),
        status: UnverifiedAccountException.status,
      }
    }

    if (error.code === 'PERMISSION_HAS_ROLES' && error.rolesCount !== undefined) {
      return {
        code: 'PERMISSION_HAS_ROLES',
        message: i18n.t('admin.permissions.has_roles', { count: error.rolesCount }),
        status: 409,
      }
    }

    if (error.code === 'ROLE_HAS_USERS' && error.usersCount !== undefined) {
      return {
        code: 'ROLE_HAS_USERS',
        message: i18n.t('admin.roles.has_users', { count: error.usersCount }),
        status: 409,
      }
    }

    if (error.code === 'E_RATE_LIMIT' && error.message) {
      return {
        code: 'E_RATE_LIMIT',
        message: error.message,
        status: 429,
      }
    }

    const errorMap: Record<string, { message: string; status: number; redirectTo?: RouteName }> = {
      E_ROW_NOT_FOUND: {
        message: i18n.t('common.not_found'),
        status: 404,
      },
      E_INVALID_CURRENT_PASSWORD: {
        message: i18n.t('profile.password.incorrect_current'),
        status: 400,
      },
      E_INVALID_PASSWORD: {
        message: i18n.t('profile.password.incorrect_password'),
        status: 400,
      },
      E_EMAIL_NOT_VERIFIED: {
        message: i18n.t('auth.verify_email.required'),
        status: 403,
      },
      E_INVALID_CREDENTIALS: {
        message: i18n.t('auth.session.login.failed'),
        status: 401,
        redirectTo: 'auth.session.render',
      },
      E_INVALID_TOKEN: {
        message: i18n.t('core.token.invalid'),
        status: 400,
        redirectTo: 'auth.session.render',
      },
      E_TOKEN_EXPIRED: {
        message: i18n.t('core.token.invalid'),
        status: 400,
        redirectTo: 'auth.session.render',
      },
      E_MAX_ATTEMPTS_EXCEEDED: {
        message: i18n.t('common.rate_limit_exceeded'),
        status: 429,
      },
      E_UNAUTHORIZED: {
        message: i18n.t('common.unauthorized'),
        status: 401,
        redirectTo: 'auth.session.render',
      },
      E_FORBIDDEN: {
        message: i18n.t('common.forbidden'),
        status: 403,
      },
      USER_ALREADY_EXISTS: {
        message: i18n.t('admin.users.user_already_exists'),
        status: 409,
      },
      E_EMAIL_EXISTS: {
        message: i18n.t('admin.users.user_already_exists'),
        status: 409,
      },
      E_EMAIL_SEND_FAILED: {
        message: i18n.t('auth.verify_email.send_failed'),
        status: 500,
      },
      E_CSRF_TOKEN_MISMATCH: {
        message: i18n.t('common.csrf_token_mismatch'),
        status: 419,
      },
      CANNOT_DELETE_SYSTEM_PERMISSION: {
        message: i18n.t('admin.permissions.cannot_delete_system'),
        status: 403,
      },
      CANNOT_MODIFY_SYSTEM_PERMISSION: {
        message: i18n.t('admin.permissions.cannot_modify_system'),
        status: 403,
      },
      CANNOT_DELETE_SYSTEM_ROLE: {
        message: i18n.t('admin.roles.cannot_delete_system'),
        status: 403,
      },
      CANNOT_MODIFY_SYSTEM_ROLE: {
        message: i18n.t('admin.roles.cannot_modify_system'),
        status: 403,
      },
      CANNOT_SELF_DELETE: {
        message: i18n.t('admin.users.cannot_delete_self'),
        status: 403,
      },
    }

    const errorInfo = errorMap[error.code] || errorMap[error.message]
    if (errorInfo) {
      return {
        code: error.code || error.message,
        ...errorInfo,
      }
    }

    if (error.status === 401) {
      return {
        code: 'E_UNAUTHORIZED',
        message: i18n.t('common.unauthorized'),
        status: 401,
        redirectTo: 'auth.session.render',
      }
    }

    if (error.status === 403) {
      return {
        code: 'E_FORBIDDEN',
        message: i18n.t('common.forbidden'),
        status: 403,
      }
    }

    return null
  }

  /**
   * Logs an unhandled error with its full HTTP context.
   *
   * Called only when no custom handler or common error mapping matched,
   * meaning the error was unexpected. The entry is emitted at `ERROR` level
   * under the {@link LogCategory.API} category.
   *
   * @param ctx - The current AdonisJS HTTP context.
   * @param error - The unhandled error to log.
   */
  private logError(ctx: HttpContext, error: any): void {
    this.logService.error({
      message: 'Error occurred',
      category: LogCategory.API,
      error,
      context: {
        url: ctx.request.url(),
        method: ctx.request.method(),
        userId: ctx.auth.user?.id,
        userEmail: ctx.auth.user?.email,
        ip: ctx.request.ip(),
        statusCode: error.status,
      },
    })
  }

  /**
   * Determines whether the current request expects a JSON response.
   *
   * Returns `true` if the `Accept` or `Content-Type` header contains
   * `application/json`, or if the URL starts with `/api/`. Used by
   * callers to decide whether to invoke {@link handle} or {@link handleApi}.
   *
   * @param ctx - The current AdonisJS HTTP context.
   * @returns `true` if the request is an API request, `false` otherwise.
   *
   * @example
   * if (this.errorHandlerService.isApiRequest(ctx)) {
   *   return this.errorHandlerService.handleApi(ctx, error)
   * }
   * return this.errorHandlerService.handle(ctx, error)
   */
  isApiRequest(ctx: HttpContext): boolean {
    const acceptHeader = ctx.request.header('accept') || ''
    const contentType = ctx.request.header('content-type') || ''

    return (
      acceptHeader.includes('application/json') ||
      contentType.includes('application/json') ||
      ctx.request.url().startsWith('/api/')
    )
  }
}
