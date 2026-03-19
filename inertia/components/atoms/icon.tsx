import { icons } from 'lucide-react'

interface IconProps {
  name: keyof typeof icons
  size?: number
  className?: string
}
export function Icon(props: IconProps) {
  const { name, size, ...iconProps } = props

  const Item = icons[name]

  if (Item) {
    return <Item size={size} {...iconProps} />
  }

  return <></>
}
