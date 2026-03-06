import { usePage } from '@inertiajs/react'
import { getAvatarInitials } from '~/helpers/avatar'
import type { SharedProps } from '@adonisjs/inertia/types'

interface AvatarProps {
  showUsername?: boolean
}

export function Avatar(props: AvatarProps) {
  const { showUsername = false } = props

  const pageProps = usePage<SharedProps>().props

  if(!pageProps.currentUser) {
    return <></>
  }

  //TODO: Return user avatar is available

  const Icon = (
    <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-semibold text-neutral-600 group-hover:bg-accent-600 group-hover:text-neutral-50 transition">
      {getAvatarInitials(pageProps.currentUser.username)}
    </div>
  )

  return (
    <div className="group flex gap-4 items-center">
      {Icon}
      {showUsername && <span className="group-hover:text-accent-600 transition">{pageProps.currentUser.username}</span>}
    </div>
  )
}
