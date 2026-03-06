import {ChangeEvent} from "react";

interface InputProps {
  name: string
  type: string
  placeholder?: string
  defaultValue?: string | number
  disabled?: boolean
  required?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void
}

export function Input(props: InputProps) {
  const {
    name,
    type,
    placeholder,
    defaultValue,
    disabled,
    required,
    onChange,
    onBlur,
    ...inputProps
  } = props


  return <input
    type={type}
    name={name}
    id={name}
    placeholder={placeholder}
    defaultValue={defaultValue}
    disabled={disabled}
    required={required}
    onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void}
    onBlur={onBlur}
    className="input"
    {...inputProps}
  />
}
