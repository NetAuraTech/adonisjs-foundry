import { type HttpContext } from '@adonisjs/core/http'

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export enum LogCategory {
  AUTH = 'auth',
  API = 'api',
  DATABASE = 'database',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  BUSINESS = 'business',
  SYSTEM = 'system',
}

export interface LogContext {
  userId?: number
  userEmail?: string
  ip?: string
  userAgent?: string
  method?: string
  url?: string
  statusCode?: number
  duration?: number
  [key: string]: any
}

export interface LogEntry {
  message: string
  level?: LogLevel
  category?: LogCategory
  context?: LogContext
  error?: Error
  metadata?: Record<string, any>
}

export interface CustomErrorHandler {
  code?: string
  exception?: any
  message?: string
  callback?: (ctx: HttpContext) => any
}

export interface ErrorHandler {
  handle(ctx: HttpContext, error: any, customHandlers?: CustomErrorHandler[]): Promise<any>
  handleApi(ctx: HttpContext, error: any, customHandlers?: CustomErrorHandler[]): Promise<any>
  isApiRequest(ctx: HttpContext): boolean
}
