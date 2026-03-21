import { Data } from '@generated/data'
import { useTranslation } from 'react-i18next'

export enum StatusEnum {
  VERIFIED = 'VERIFIED',
  UNVERIFIED = 'UNVERIFIED',
  PENDING_INVITE = 'PENDING_INVITE',
}

interface UserStatusProps {
  status: StatusEnum
  user: Data.User['id']
}

export function UserStatus(props: UserStatusProps) {
  const { status, user } = props
  const { t } = useTranslation('admin')

  const statuses = {
    VERIFIED: (
      <span className="px-4 py-1 border rounded text-success border-success bg-success-soft">
        {t('users.status.verified')}
      </span>
    ),
    UNVERIFIED: (
      <span className="px-4 py-1 border rounded text-danger border-danger bg-danger-soft">
        {t('users.status.unverified')}
      </span>
    ),
    PENDING_INVITE: (
      <span className="px-4 py-1 border rounded text-accent border-accent bg-accent-light/20">
        {t('users.status.pending_invite')}
      </span>
    ),
  }

  return <>{statuses[status]}</>
}
