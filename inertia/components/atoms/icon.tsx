import { icons } from "lucide-react";

interface IconProps {
  name: keyof typeof icons,
  size ?: number,
}
export function Icon(props: IconProps) {
  const { name, size } = props

  const Item = icons[name]

  if(Item) {
    return <Item size={size} />
  }

  return <></>
}
