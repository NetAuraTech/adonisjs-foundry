interface LabelProps {
  label: string
  htmlFor: string
  required?: boolean
}

export function Label(props: LabelProps) {
  const { label, htmlFor, required } = props

  return (
    <label
      htmlFor={htmlFor}
      className="font-bold"
    >
      {label}
      {required && <span className="ml-1 text-red-700">*</span>}
    </label>
  )
}
