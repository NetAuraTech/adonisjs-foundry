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
    <div className="w-12 h-12 rounded-full bg-sunken flex items-center justify-center text-sm font-semibold text-ink-muted group-hover:bg-accent group-hover:text-ink-inverted transition">
      {getAvatarInitials(user.username)}
    </div>
  )

  return (
    <div className="group flex gap-4 items-center">
      {Icon}
      {showUsername && (
        <span className="text-ink group-hover:text-accent transition">{user.username}</span>
      )}
    </div>
  )
}
