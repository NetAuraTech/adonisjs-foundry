export const TOKEN_TYPES = {
  PASSWORD_RESET: 'PASSWORD_RESET',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  EMAIL_CHANGE: 'EMAIL_CHANGE',
  USER_INVITATION: 'USER_INVITATION',
} as const

export type TokenType = (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES]

export interface FindOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export type FullToken = `${string}.${string}`
