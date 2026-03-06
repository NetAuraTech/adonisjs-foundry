import i18n from 'i18next'

/**
 * The result returned by every {@link ValidationRule}.
 *
 * When `valid` is `false`, `message` contains a translated, human-readable
 * error string ready to be displayed in the UI.
 */
export interface ValidationResult {
  /** Whether the value passed the rule. */
  valid: boolean
  /** Translated error message, present only when `valid` is `false`. */
  message?: string
}

/**
 * A function that validates a single value and returns a {@link ValidationResult}.
 *
 * @param value - The value to validate.
 * @param fieldName - Optional i18n key used to produce a translated field label
 *   in the error message (e.g. `'email'`, `'username'`).
 */
export type ValidationRule = (value: any, fieldName?: string) => ValidationResult

/**
 * Factory that produces a {@link ValidationRule} from a predicate, an i18n key,
 * and an optional parameter builder.
 *
 * The resulting rule translates the field label via
 * `validation:fields.<fieldName>` and the error message via
 * `validation:<messageKey>`, injecting any extra params returned by
 * `messageParams`.
 *
 * @param validator - Pure predicate that returns `true` when the value is valid.
 * @param messageKey - Key suffix used to look up the error in the
 *   `validation` i18n namespace (e.g. `'required'`, `'min_length'`).
 * @param messageParams - Optional function that returns extra interpolation
 *   params merged into the i18n translation call.
 * @returns A ready-to-use {@link ValidationRule}.
 */
function createRule(
  validator: (value: any) => boolean,
  messageKey: string,
  messageParams?: (value: any, fieldName?: string) => Record<string, any>
): ValidationRule {
  return (value: any, fieldName?: string) => {
    const valid = validator(value)
    if (valid) {
      return { valid: true }
    }

    const translatedField = fieldName
      ? i18n.t(`validation:fields.${fieldName}`, { defaultValue: fieldName })
      : i18n.t('validation:required', { field: '' })

    const params = messageParams ? messageParams(value, fieldName) : {}

    return {
      valid: false,
      message: i18n.t(`validation:${messageKey}`, {
        ...params,
        field: translatedField,
      }),
    }
  }
}

/**
 * Collection of built-in, composable validation rules.
 *
 * Every rule is a factory function that returns a {@link ValidationRule} so
 * that parameters (min length, allowed values, etc.) are captured at
 * definition time and the rule itself remains a pure, stateless function.
 *
 * @example
 * const emailRule = rules.email()
 * const result = emailRule('not-an-email') // { valid: false, message: '...' }
 */
export const rules = {
  /**
   * Ensures the value is not `undefined`, `null`, or an empty string.
   *
   * @param fieldNameKey - i18n key for the field label used in the error message.
   * @returns A {@link ValidationRule} that fails on empty values.
   *
   * @example
   * rules.required('email')
   */
  required: (fieldNameKey?: string): ValidationRule =>
    createRule(
      (value) => value !== undefined && value !== null && value !== '',
      'required',
      () => ({ field: fieldNameKey })
    ),

  /**
   * Validates that the value is a well-formed email address.
   *
   * Empty values pass this rule — combine with {@link rules.required} when
   * the field is mandatory.
   *
   * @returns A {@link ValidationRule} that fails on malformed email addresses.
   *
   * @example
   * rules.email()
   */
  email: (): ValidationRule =>
    createRule((value) => {
      if (!value) return true
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    }, 'email'),

  /**
   * Ensures the value's string length is at least `min` characters.
   *
   * Empty values pass this rule — combine with {@link rules.required} when
   * the field is mandatory.
   *
   * @param min - Minimum number of characters required.
   * @param fieldNameKey - i18n key for the field label used in the error message.
   * @returns A {@link ValidationRule} that fails when the value is too short.
   *
   * @example
   * rules.minLength(8, 'password')
   */
  minLength: (min: number, fieldNameKey?: string): ValidationRule =>
    createRule(
      (value) => !value || String(value).length >= min,
      'min_length',
      (value) => ({
        min,
        current: value ? String(value).length : 0,
        field: fieldNameKey,
      })
    ),

  /**
   * Ensures the value's string length does not exceed `max` characters.
   *
   * Empty values pass this rule — combine with {@link rules.required} when
   * the field is mandatory.
   *
   * @param max - Maximum number of characters allowed.
   * @param fieldNameKey - i18n key for the field label used in the error message.
   * @returns A {@link ValidationRule} that fails when the value is too long.
   *
   * @example
   * rules.maxLength(255, 'username')
   */
  maxLength: (max: number, fieldNameKey?: string): ValidationRule =>
    createRule(
      (value) => !value || String(value).length <= max,
      'max_length',
      (value) => ({
        max,
        current: value ? String(value).length : 0,
        field: fieldNameKey,
      })
    ),

  /**
   * Ensures the value matches another field's value.
   *
   * Primarily used for password confirmation fields. Two empty values are
   * considered matching to avoid false positives on untouched forms.
   *
   * @param otherValue - The value to compare against (e.g. the password field's current value).
   * @param otherFieldNameKey - i18n key for the other field's label, used in the error message.
   * @returns A {@link ValidationRule} that fails when the two values differ.
   *
   * @example
   * rules.matches(passwordValue, 'password')
   */
  matches: (otherValue: any, otherFieldNameKey: string): ValidationRule =>
    createRule(
      (value) => (!value && !otherValue) || value === otherValue,
      'matches',
      () => ({
        other: i18n.t(`validation:fields.${otherFieldNameKey}`, {
          defaultValue: otherFieldNameKey,
        }),
      })
    ),

  /**
   * Validates the value against a regular expression.
   *
   * Empty values pass this rule — combine with {@link rules.required} when
   * the field is mandatory.
   *
   * @param regex - The regular expression to test against.
   * @param customI18nKey - Key suffix in the `validation` namespace used to
   *   look up the error message (e.g. `'phone_format'`).
   * @returns A {@link ValidationRule} that fails when the pattern does not match.
   *
   * @example
   * rules.pattern(/^\+?[0-9]{7,15}$/, 'phone_format')
   */
  pattern: (regex: RegExp, customI18nKey: string): ValidationRule =>
    createRule((value) => !value || regex.test(String(value)), customI18nKey),

  /**
   * Wraps an arbitrary predicate into a {@link ValidationRule}.
   *
   * Use this when none of the built-in rules fit the use case.
   *
   * @param validator - A pure function that returns `true` when the value is valid.
   * @param i18nKey - Key suffix in the `validation` namespace used to look up
   *   the error message.
   * @returns A {@link ValidationRule} backed by the provided predicate.
   *
   * @example
   * rules.custom((value) => value % 2 === 0, 'must_be_even')
   */
  custom: (validator: (value: any) => boolean, i18nKey: string): ValidationRule =>
    createRule(validator, i18nKey),

  /**
   * Ensures the value belongs to a predefined list of allowed values.
   *
   * Empty values (`''`, `'0'`, `undefined`, `null`) are considered valid to
   * support optional select fields. Comparison is performed on stringified
   * values so that `1` and `'1'` are treated as equivalent.
   *
   * @param allowedValues - The list of accepted values.
   * @param fieldNameKey - i18n key for the field label used in the error message.
   * @returns A {@link ValidationRule} that fails when the value is not in the list.
   *
   * @example
   * rules.oneOf(['active', 'inactive', 'banned'], 'status')
   */
  oneOf: (allowedValues: (string | number)[], fieldNameKey?: string): ValidationRule =>
    createRule(
      (value) => {
        if (!value || value === '' || value === '0') return true

        const normalizedAllowed = allowedValues.map((v) => String(v))
        const normalizedValue = String(value)

        return normalizedAllowed.includes(normalizedValue)
      },
      'one_of',
      (value) => ({
        field: fieldNameKey,
        value: value,
      })
    ),
}

/**
 * Runs a value through an ordered list of {@link ValidationRule}s, returning
 * the first failing result or `{ valid: true }` if all rules pass.
 *
 * Rules are evaluated in order and short-circuit on the first failure, so
 * place the most fundamental rules (e.g. `required`) first.
 *
 * @param value - The value to validate.
 * @param validationRules - Ordered list of rules to apply.
 * @param fieldNameKey - Optional i18n key for the field label, forwarded to
 *   each rule for error message interpolation.
 * @returns The first failing {@link ValidationResult}, or `{ valid: true }`.
 *
 * @example
 * const result = validate(email, [rules.required('email'), rules.email()])
 * if (!result.valid) console.error(result.message)
 */
export function validate(
  value: any,
  validationRules: ValidationRule[],
  fieldNameKey?: string
): ValidationResult {
  for (const rule of validationRules) {
    const result = rule(value, fieldNameKey)
    if (!result.valid) return result
  }
  return { valid: true }
}

/**
 * Ready-made rule arrays for the most common form fields.
 *
 * Presets are designed to be passed directly to {@link validate} or spread
 * into a custom rule array. Parameterised presets (e.g.
 * {@link presets.passwordConfirmation}) are factory functions.
 *
 * @example
 * // Static preset
 * validate(value, presets.email)
 *
 * // Parameterised preset
 * validate(value, presets.passwordConfirmation(passwordValue))
 */
export const presets = {
  /** Required + valid email format. */
  email: [rules.required('email'), rules.email()],

  /** Required + minimum 8 characters. */
  password: [rules.required('password'), rules.minLength(8, 'password')],

  /**
   * Required + must match the provided password value.
   *
   * @param passwordToMatch - The current value of the password field.
   * @returns A rule array for the confirmation field.
   *
   * @example
   * validate(confirmValue, presets.passwordConfirmation(passwordValue))
   */
  passwordConfirmation: (passwordToMatch: string) => [
    rules.required('password_confirmation'),
    rules.matches(passwordToMatch, 'password'),
  ],

  /** Required + between 2 and 255 characters. */
  username: [
    rules.required('username'),
    rules.minLength(2, 'username'),
    rules.maxLength(255, 'username'),
  ],

  /** Optional + max 255 characters. */
  search: [rules.maxLength(255, 'search')],

  /** Optional select field — max 255 characters, no allowed-values constraint. */
  select: [rules.maxLength(255, 'select')],

  /**
   * Optional select field with allowed-values validation.
   *
   * @param allowedValues - List of accepted values (normalised to strings for comparison).
   * @param fieldNameKey - i18n key for the field label (default: `'select'`).
   * @returns A rule array for a constrained select field.
   *
   * @example
   * validate(value, presets.selectWithOptions(['admin', 'user', 'guest'], 'role'))
   */
  selectWithOptions: (allowedValues: (string | number)[], fieldNameKey: string = 'select') => [
    rules.maxLength(255, fieldNameKey),
    rules.oneOf(allowedValues, fieldNameKey),
  ],
}
