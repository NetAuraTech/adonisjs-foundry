import { useEffect, useRef, useCallback, useState } from 'react'
import { usePage } from '@inertiajs/react'
import { Transmit } from '@adonisjs/transmit-client'
import { applyOperation } from '~/utils/builder_reducer'
import type { PageContent } from '#types/page'
import type {
  BuilderOperation,
  BroadcastPayload,
  ServerBroadcastEvent,
  UserSession,
} from '#types/builder'
import { v4 as uuid } from 'uuid'
import { type SharedProps } from '@adonisjs/inertia/types'

interface UseBuilderSyncOptions {
  pageId: number
  translationId: number
  /** Current content — used by the emit helpers to read blockId context */
  content: PageContent
  /** Called whenever a remote operation changes the content */
  onContentChange: (next: PageContent) => void
}

export interface LockState {
  blockId: string
  fieldKey: string
  userId: number
  userName: string
  userColor: string
  expiresAt: string
}

interface UseBuilderSyncReturn {
  /** List of currently connected editors (excludes self) */
  presence: UserSession[]
  /** Active field locks held by OTHER users (own locks are excluded) */
  locks: LockState[]
  /** Whether the SSE channel is connected */
  connected: boolean
  /** The authenticated user's ID — used by consumers to detect own locks */
  currentUserId: number
  /** Emit any builder operation to the server */
  emit: (op: BuilderOperation) => Promise<{ operationId?: string; error?: any } | void>
  /**
   * Acquire a lock on a block field.
   * Returns `{ acquired: true }` or `{ acquired: false, lock }` on conflict.
   */
  acquireLock: (
    blockId: string,
    fieldKey: string
  ) => Promise<{ acquired: boolean; lock?: LockState }>
  /** Release a field lock explicitly */
  releaseLock: (blockId: string, fieldKey: string) => Promise<void>
  /** Returns the lock for a given field, or null */
  getLock: (blockId: string, fieldKey: string) => LockState | null
}

/**
 * Connects to the Transmit SSE channel for the given translation, manages
 * collaborative presence and optimistic locks, and applies remote operations
 * to the local `PageContent` via the pure `applyOperation` reducer.
 *
 * **Deduplication**
 * When we emit an operation, the server broadcasts it to all subscribers
 * including us. We track emitted `operationId` values and skip them when
 * they arrive via SSE to avoid double-applying our own ops.
 *
 * **Debouncing**
 * `UPDATE_PROPS` ops are debounced at 150ms so rapid keystrokes don't flood
 * the server. Other op types are sent immediately.
 */
export function useBuilderSync({
  pageId,
  translationId,
  content,
  onContentChange,
}: UseBuilderSyncOptions): UseBuilderSyncReturn {
  const pageProps = usePage<SharedProps>().props
  const currentUserId = pageProps?.currentUser?.id ?? 0

  const [presence, setPresence] = useState<UserSession[]>([])
  const [locks, setLocks] = useState<LockState[]>([])
  const [connected, setConnected] = useState(false)

  const emittedIds = useRef<Set<string>>(new Set())

  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const channel = `admin/pages/${pageId}/translations/${translationId}`

  useEffect(() => {
    const client = new Transmit({
      baseUrl: window.location.origin,
      uidGenerator: () => uuid(),
    })

    const subscription = client.subscription(channel)

    subscription.create().then(() => setConnected(true))

    fetch(`/api/admin/builder/presence/${translationId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': pageProps.csrfToken,
      },
    })
      .then((r) => r.json())
      .then(({ sessions, locks: initialLocks }) => {
        setPresence(sessions ?? [])
        setLocks(initialLocks ?? [])
      })
      .catch(() => {})

    subscription.onMessage<BroadcastPayload | ServerBroadcastEvent>((event) => {
      const ev = event as any
      console.log(ev)

      if (ev.op === 'PRESENCE_JOINED') {
        setPresence((prev) => {
          if (prev.some((s) => s.userId === ev.userId)) return prev
          return [
            ...prev,
            {
              userId: ev.userId,
              userName: ev.userName,
              userEmail: '',
              color: ev.userColor,
              joinedAt: new Date(),
            },
          ]
        })
        return
      }

      if (ev.op === 'PRESENCE_LEFT') {
        setPresence((prev) => prev.filter((s) => s.userId !== ev.userId))
        return
      }

      if (ev.op === 'LOCK_ACQUIRED') {
        if (ev.userId === currentUserId) return
        setLocks((prev) => {
          const without = prev.filter(
            (l) => !(l.blockId === ev.blockId && l.fieldKey === ev.fieldKey)
          )
          return [
            ...without,
            {
              blockId: ev.blockId,
              fieldKey: ev.fieldKey,
              userId: ev.userId,
              userName: ev.userName,
              userColor: ev.userColor,
              expiresAt: ev.expiresAt,
            },
          ]
        })
        return
      }

      if (ev.op === 'LOCK_RELEASED' || ev.op === 'LOCK_EXPIRED') {
        setLocks((prev) =>
          prev.filter((l) => !(l.blockId === ev.blockId && l.fieldKey === ev.fieldKey))
        )
        return
      }

      if (ev.operationId && emittedIds.current.has(ev.operationId)) {
        emittedIds.current.delete(ev.operationId)
        return
      }

      if (ev.op === 'CURSOR') return

      const updated = applyOperation(content, ev as BuilderOperation)
      onContentChange(updated)
    })

    return () => {
      subscription.delete().then(() => setConnected(false))
    }
  }, [pageId, translationId])

  const emit = useCallback(
    async (op: BuilderOperation) => {
      const send = async () => {
        try {
          const res = await fetch('/api/admin/builder/operations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              'X-CSRF-Token': pageProps.csrfToken,
            },
            body: JSON.stringify({ pageId, translationId, ...op }),
          })
          const data = await res.json()
          if (data.operationId) {
            emittedIds.current.add(data.operationId)
          }
          return data
        } catch (err) {
          console.error('[BuilderSync] emit error', err)
        }
      }

      if (op.op === 'UPDATE_PROPS') {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(send, 150)
        return
      }

      return send()
    },
    [pageId, translationId]
  )

  const acquireLock = useCallback(
    async (blockId: string, fieldKey: string) => {
      try {
        const res = await fetch('/api/admin/builder/operations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-Token': pageProps.csrfToken,
          },
          body: JSON.stringify({ pageId, translationId, op: 'LOCK_ACQUIRE', blockId, fieldKey }),
        })
        const data = await res.json()

        if (res.ok) return { acquired: true }

        if (res.status === 409) {
          console.debug('[BuilderSync] lock conflict:', data.error?.lock)
          return { acquired: false, lock: data.error?.lock }
        }

        console.warn('[BuilderSync] acquireLock failed:', res.status, data)
        return { acquired: false }
      } catch (err) {
        console.error('[BuilderSync] acquireLock error:', err)
        return { acquired: false }
      }
    },
    [pageId, translationId]
  )

  const releaseLock = useCallback(
    async (blockId: string, fieldKey: string) => {
      await fetch('/api/admin/builder/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': pageProps.csrfToken,
        },
        body: JSON.stringify({ pageId, translationId, op: 'LOCK_RELEASE', blockId, fieldKey }),
      }).catch(() => {})
    },
    [pageId, translationId]
  )

  const getLock = useCallback(
    (blockId: string, fieldKey: string): LockState | null => {
      return locks.find((l) => l.blockId === blockId && l.fieldKey === fieldKey) ?? null
    },
    [locks]
  )

  return { presence, locks, connected, currentUserId, emit, acquireLock, releaseLock, getLock }
}
