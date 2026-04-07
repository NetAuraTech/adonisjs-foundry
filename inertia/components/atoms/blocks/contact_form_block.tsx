import { useContactForm } from '~/hooks/use_contact_form'
import type { ResolvedBlock } from '#types/page'

interface ContactFormBlockProps {
  block: ResolvedBlock<'contact_form'>
  pageId: number
  locale: string
}

/**
 * Contact form block — the only stateful block in the renderer.
 *
 * Renders dynamic fields (text, email, textarea, select) using the project's
 * existing Input/Textarea/Select components and submits via `useContactForm`
 * to `POST /contact`. On success, replaces the form with `successMessage`.
 */
export default function ContactFormBlock({ block, pageId, locale }: ContactFormBlockProps) {
  const { title, fields, recipientEmail, submitLabel, successMessage } = block.props

  const { formState, setValue, submit, isSubmitting, isSuccess, serverError } = useContactForm({
    pageId,
    locale,
    recipientEmail,
    fields,
  })

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-success bg-success-soft p-6 text-ink">
        <p className="font-medium">{successMessage ?? 'Your message has been sent!'}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-edge bg-surface p-6 md:p-8">
      {title && <h2 className="mb-6 text-xl font-semibold text-ink">{title}</h2>}

      <form onSubmit={submit} noValidate className="space-y-4">
        {fields.map((field) => {
          const state = formState[field.name]
          const hasError = !!state?.error

          const inputClasses = [
            'w-full rounded-lg border px-3 py-2 text-sm text-ink bg-canvas',
            'focus:outline-none focus:ring-2 focus:ring-primary-light/35 focus:border-primary',
            'transition-colors placeholder:text-ink-subtle',
            hasError ? 'border-danger' : 'border-edge',
          ].join(' ')

          return (
            <div key={field.name} className="flex flex-col gap-1">
              <label htmlFor={field.name} className="text-sm font-medium text-ink">
                {field.label}
                {field.required && (
                  <span className="ml-1 text-danger" aria-hidden="true">
                    *
                  </span>
                )}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={4}
                  placeholder={field.placeholder ?? ''}
                  required={field.required}
                  value={state?.value ?? ''}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  className={`${inputClasses} resize-none`}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${field.name}-error` : undefined}
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={state?.value ?? ''}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  className={inputClasses}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${field.name}-error` : undefined}
                >
                  <option value="">{field.placeholder ?? 'Select an option'}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type ?? 'text'}
                  placeholder={field.placeholder ?? ''}
                  required={field.required}
                  value={state?.value ?? ''}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  className={inputClasses}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${field.name}-error` : undefined}
                />
              )}

              {hasError && (
                <p id={`${field.name}-error`} className="text-xs text-danger">
                  {state?.error}
                </p>
              )}
            </div>
          )
        })}

        {serverError && (
          <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-lg bg-primary-mid px-5 py-2.5 text-sm font-medium text-ink-inverted transition-colors hover:bg-primary-deep disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending…' : (submitLabel ?? 'Send')}
        </button>
      </form>
    </div>
  )
}
