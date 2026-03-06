import {ChangeEvent} from "react";

interface TextareaProps {
  name: string
  placeholder?: string
  defaultValue?: string | number
  cols?: number
  rows?: number
  disabled?: boolean
  required?: boolean
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (event: ChangeEvent<HTMLTextAreaElement>) => void
}

export function Textarea(props: TextareaProps) {
  const {
    name,
    placeholder,
    defaultValue,
    cols,
    rows,
    disabled,
    required,
    onChange,
    onBlur,
    ...inputProps
  } = props


  return <textarea
    name={name}
    id={name}
    cols={cols}
    rows={rows || 4}
    placeholder={placeholder}
    defaultValue={defaultValue}
    disabled={disabled}
    required={required}
    onChange={onChange as (e: ChangeEvent<HTMLTextAreaElement>) => void}
    onBlur={onBlur}
    className="textarea"
    {...inputProps}
  />
}
