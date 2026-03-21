import { icons } from 'lucide-react'

interface IconProps {
  /** Name of the Lucide icon to render. Must be a valid key of the `icons` map. */
  name: keyof typeof icons
  /** Icon size in pixels. Forwarded directly to the Lucide component. */
  size?: number
  /** Additional Tailwind classes (e.g. `text-danger`, `shrink-0`). */
  className?: string
}

/**
 * Thin wrapper around the Lucide icon library.
 *
 * Looks up `name` in the Lucide `icons` map and renders the matching SVG
 * component. Returns an empty fragment when the icon is not found, so
 * invalid names fail silently rather than throwing.
 *
 * @example
 * <Icon name="Trash" size={18} className="text-danger" />
 * <Icon name="Check" size={16} />
 */
export function Icon(props: IconProps) {
  const { name, size, ...iconProps } = props

  const Item = icons[name]

  if (Item) {
    return <Item size={size} {...iconProps} />
  }

  return <></>
}
