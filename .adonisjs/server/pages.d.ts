import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auth/front/define_password': ExtractProps<(typeof import('../../inertia/pages/auth/front/define_password.tsx'))['default']>
    'auth/front/forgot_password': ExtractProps<(typeof import('../../inertia/pages/auth/front/forgot_password.tsx'))['default']>
    'auth/front/login': ExtractProps<(typeof import('../../inertia/pages/auth/front/login.tsx'))['default']>
    'auth/front/register': ExtractProps<(typeof import('../../inertia/pages/auth/front/register.tsx'))['default']>
    'auth/front/reset_password': ExtractProps<(typeof import('../../inertia/pages/auth/front/reset_password.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
  }
}
