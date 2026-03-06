
interface SelectOptionProps {
  label: string
  value?: string | number
}
export function SelectOption(props: SelectOptionProps) {
  const { label, value } = props

  return <option value={value}>{ label }</option>
}