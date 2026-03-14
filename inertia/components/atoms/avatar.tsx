import { getAvatarInitials } from '~/helpers/avatar'
import { useAuth } from '~/hooks/use_auth'

interface AvatarProps {
  showUsername?: boolean
}

export function Avatar(props: AvatarProps) {
  const { showUsername = false } = props

  const { user } = useAuth()

  if (!user) {
    return <></>
  }

  //TODO: Return user avatar is available

  const Icon = (
    <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-semibold text-neutral-600 group-hover:bg-accent-600 group-hover:text-neutral-50 transition">
      {getAvatarInitials(user.username)}
    </div>
  )

  return (
    <div className="group flex gap-4 items-center">
      {Icon}
      {showUsername && (
        <span className="text-primary-950 group-hover:text-accent-600 transition">
          {user.username}
        </span>
      )}
    </div>
  )
}
