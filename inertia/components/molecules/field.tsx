import type {ChangeEvent, ReactNode} from "react";
import {Label} from "~/components/atoms/label";
import {getSanitizer} from "~/helpers/sanitization";
import {Paragraph} from "~/components/atoms/paragraph";
import {Input} from "~/components/atoms/input";
import {Textarea} from "~/components/atoms/textarea";
import {Select} from "~/components/atoms/select";
import {Checkbox} from "~/components/atoms/checkbox";

interface FieldProps {
  label: string
  name: string
  type: string
  placeholder?: string
  defaultValue?: string | number
  checked?: boolean
  options?: Array<{ value: string; label: string }>
  cols?: number
  rows?: number
  disabled?: boolean
  required?: boolean
  errorMessage?: string
  helpText?: string
  helpClassName?: string
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onBlur?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  sanitize?: boolean
  children?: ReactNode
}

export function Field(props: FieldProps) {
  const {
    label,
    name,
    type,
    errorMessage,
    helpText,
    helpClassName,
    onChange,
    onBlur,
    sanitize = true,
    ...inputProps
  } = props

  const isInline = type === 'checkbox' || type === 'radio'
  const variant = isInline ? 'inline' : 'grid'
  const sanitizer = getSanitizer(type, sanitize)

  /**
   * Handle change - NO sanitization during typing
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange?.(event)
  }

  /**
   * Handle blur - Apply sanitization when user leaves the field
   */
  const handleBlur = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (type !== 'checkbox' && type !== 'radio' && sanitize) {
      const sanitizedValue = sanitizer(event.target.value)

      if (sanitizedValue !== event.target.value) {
        event.target.value = sanitizedValue
        onChange?.(event)
      }
    }

    onBlur?.(event)
  }

  const getComponentFromType = (type: string) => {
    switch (type) {
      case 'textarea':
        return Textarea
      case 'select':
        return Select
      case 'checkbox':
        return Checkbox
      default:
        return Input
    }
  }

  const Component = getComponentFromType(type)

  const variants = {
    inline: 'flex items-center gap-2',
    grid: 'grid gap-2'
  }

  return <div className={`grid`}>
    <div className={`${variants[variant]}`}>
      {!isInline && <Label label={label} htmlFor={name} required={props.required} />}
      <Component
        {...inputProps}
        name={name}
        type={type}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {isInline && <Label label={label} htmlFor={name} required={props.required} />}
    </div>
    {errorMessage && (
      <Paragraph
        variant="error"
        spacing="sm"
      >
        {errorMessage}
      </Paragraph>
    )}
    {helpText && (
      <Paragraph
        variant="muted"
        spacing={errorMessage ? 'xs' : 'sm'}
      >
        {helpText}
      </Paragraph>
    )}
  </div>
}
