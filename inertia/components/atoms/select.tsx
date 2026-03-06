import {ChangeEvent, ReactNode} from "react";
import {useTranslation} from "react-i18next";
import {SelectOption} from "~/components/atoms/select_option";

interface SelectProps {
  name: string
  type: string
  placeholder?: string
  defaultValue?: string | number
  disabled?: boolean
  required?: boolean
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void
  onBlur?: (event: ChangeEvent<HTMLSelectElement>) => void
  children?: ReactNode
}

export function Select(props: SelectProps) {
  const { t } = useTranslation('common')
  const {
    name,
    type,
    placeholder,
    defaultValue,
    disabled,
    required,
    onChange,
    onBlur,
    children,
    ...inputProps
  } = props


  return <select
    name={name}
    id={name}
    defaultValue={defaultValue}
    disabled={disabled}
    required={required}
    onChange={onChange as (e: ChangeEvent<HTMLSelectElement>) => void}
    onBlur={onBlur}
    className={`select`}
    {...inputProps}
  >
    <SelectOption
      label={placeholder || t('select.default_placeholder')}
    />
    { children }
  </select>
}
