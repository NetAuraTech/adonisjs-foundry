import type UserTransformer from '#transformers/user_transformer'

/**
 * Inferred type from UserTransformer output.
 * Automatically stays in sync with transformer changes.
 */
export type AuthUser = ReturnType<InstanceType<typeof UserTransformer>['toObject']>
