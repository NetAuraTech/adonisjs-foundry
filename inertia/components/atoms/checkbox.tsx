import {ChangeEvent} from "react";

interface CheckboxProps {
  name: string
  checked?: boolean
  disabled?: boolean
  required?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void
}

export function Checkbox(props: CheckboxProps) {
  const {
    name,
    checked,
    disabled,
    required,
    onChange,
    onBlur,
    ...inputProps
  } = props


  return <input
    type="checkbox"
    name={name}
    id={name}
    defaultChecked={checked}
    disabled={disabled}
    required={required}
    onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void}
    onBlur={onBlur}
    className="checkbox accent-accent-800 focus:border-accent-800"
    {...inputProps}
  />
}
