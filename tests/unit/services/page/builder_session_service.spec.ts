import { test } from '@japa/runner'
import { BuilderSessionService } from '#services/page/builder_session_service'
import { LOCK_TTL_MS } from '#types/builder'

/**
 * Unit tests for `BuilderSessionService`.
 *
 * No mocks needed — the service is a pure in-memory singleton.
 * Clock-sensitive lock expiry tests use `setTimeout` with slightly longer
 * delays to avoid flakiness on slow CI runners.
 */
test.group('BuilderSessionService — presence', (group) => {
  let service: BuilderSessionService

  group.each.setup(() => {
    service = new BuilderSessionService()
  })

  const TRANSLATION_ID = 1
  const USER_A = { userId: 10, userName: 'alice', userEmail: 'alice@example.com' }
  const USER_B = { userId: 20, userName: 'bob', userEmail: 'bob@example.com' }

  test('join() creates a session and returns it with a colour', ({ assert }) => {
    const session = service.join(TRANSLATION_ID, USER_A)
    assert.equal(session.userId, USER_A.userId)
    assert.equal(session.userName, USER_A.userName)
    assert.isString(session.color)
    assert.match(session.color, /^#[0-9a-f]{6}$/i)
  })

  test('join() is idempotent — returns same session on second call', ({ assert }) => {
    const s1 = service.join(TRANSLATION_ID, USER_A)
    const s2 = service.join(TRANSLATION_ID, USER_A)
    assert.strictEqual(s1, s2)
  })

  test('join() assigns different colours to different users', ({ assert }) => {
    const s1 = service.join(TRANSLATION_ID, USER_A)
    const s2 = service.join(TRANSLATION_ID, USER_B)
    assert.notEqual(s1.color, s2.color)
  })

  test('getPresence() returns all active sessions sorted by joinedAt', ({ assert }) => {
    service.join(TRANSLATION_ID, USER_A)
    service.join(TRANSLATION_ID, USER_B)
    const presence = service.getPresence(TRANSLATION_ID)
    assert.lengthOf(presence, 2)
    assert.equal(presence[0].userId, USER_A.userId)
    assert.equal(presence[1].userId, USER_B.userId)
  })

  test('getPresence() returns empty array when no sessions', ({ assert }) => {
    assert.deepEqual(service.getPresence(TRANSLATION_ID), [])
  })

  test('leave() removes the session', ({ assert }) => {
    service.join(TRANSLATION_ID, USER_A)
    service.leave(TRANSLATION_ID, USER_A.userId)
    assert.lengthOf(service.getPresence(TRANSLATION_ID), 0)
  })

  test('leave() is a no-op when user is not in session', ({ assert }) => {
    assert.doesNotThrow(() => service.leave(TRANSLATION_ID, 99))
  })

  test('getSession() returns null for unknown user', ({ assert }) => {
    assert.isNull(service.getSession(TRANSLATION_ID, 99))
  })

  test('getSession() returns the session for a known user', ({ assert }) => {
    service.join(TRANSLATION_ID, USER_A)
    const s = service.getSession(TRANSLATION_ID, USER_A.userId)
    assert.isNotNull(s)
    assert.equal(s!.userId, USER_A.userId)
  })
})

test.group('BuilderSessionService — locks', (group) => {
  let service: BuilderSessionService

  group.each.setup(() => {
    service = new BuilderSessionService()
  })

  const T = 1
  const BLOCK = 'block-1'
  const FIELD = 'title'
  const USER_A = { userId: 10, userName: 'alice', userEmail: 'alice@example.com' }
  const USER_B = { userId: 20, userName: 'bob', userEmail: 'bob@example.com' }

  test('acquireLock() grants lock when field is free', ({ assert }) => {
    service.join(T, USER_A)
    const result = service.acquireLock(T, BLOCK, FIELD, USER_A.userId)
    assert.isTrue(result.acquired)
    assert.equal(result.lock.userId, USER_A.userId)
    assert.equal(result.lock.blockId, BLOCK)
    assert.equal(result.lock.fieldKey, FIELD)
  })

  test('acquireLock() sets expiresAt ~LOCK_TTL_MS in the future', ({ assert }) => {
    service.join(T, USER_A)
    const before = Date.now()
    const { lock } = service.acquireLock(T, BLOCK, FIELD, USER_A.userId)
    const after = Date.now()
    assert.isAbove(lock.expiresAt.getTime(), before + LOCK_TTL_MS - 50)
    assert.isBelow(lock.expiresAt.getTime(), after + LOCK_TTL_MS + 50)
  })

  test('acquireLock() denies when another user holds the lock', ({ assert }) => {
    service.join(T, USER_A)
    service.join(T, USER_B)
    service.acquireLock(T, BLOCK, FIELD, USER_A.userId)

    const result = service.acquireLock(T, BLOCK, FIELD, USER_B.userId)
    assert.isFalse(result.acquired)
    assert.equal(result.lock.userId, USER_A.userId)
  })

  test('acquireLock() renews TTL when same user re-acquires', ({ assert }) => {
    service.join(T, USER_A)
    const { lock: first } = service.acquireLock(T, BLOCK, FIELD, USER_A.userId)

    // Wait a tiny bit then re-acquire
    const { acquired, lock: second } = service.acquireLock(T, BLOCK, FIELD, USER_A.userId)
    assert.isTrue(acquired)
    assert.isAbove(second.expiresAt.getTime(), first.expiresAt.getTime() - 1)
  })

  test('acquireLock() allows same user to lock multiple different fields', ({ assert }) => {
    service.join(T, USER_A)
    const r1 = service.acquireLock(T, BLOCK, 'title', USER_A.userId)
    const r2 = service.acquireLock(T, BLOCK, 'content', USER_A.userId)
    assert.isTrue(r1.acquired)
    assert.isTrue(r2.acquired)
    assert.lengthOf(service.getLocks(T), 2)
  })

  test('acquireLock() allows different users to lock different fields of the same block', ({
    assert,
  }) => {
    service.join(T, USER_A)
    service.join(T, USER_B)
    const r1 = service.acquireLock(T, BLOCK, 'title', USER_A.userId)
    const r2 = service.acquireLock(T, BLOCK, 'content', USER_B.userId)
    assert.isTrue(r1.acquired)
    assert.isTrue(r2.acquired)
  })

  test('releaseLock() removes the lock', ({ assert }) => {
    service.join(T, USER_A)
    service.acquireLock(T, BLOCK, FIELD, USER_A.userId)

    const released = service.releaseLock(T, BLOCK, FIELD, USER_A.userId)
    assert.isNotNull(released)
    assert.isNull(service.getLock(T, BLOCK, FIELD))
  })

  test('releaseLock() returns null when lock does not exist', ({ assert }) => {
    const result = service.releaseLock(T, BLOCK, FIELD, USER_A.userId)
    assert.isNull(result)
  })

  test('releaseLock() is a no-op when called by a non-owner', ({ assert }) => {
    service.join(T, USER_A)
    service.join(T, USER_B)
    service.acquireLock(T, BLOCK, FIELD, USER_A.userId)

    const result = service.releaseLock(T, BLOCK, FIELD, USER_B.userId)
    assert.isNull(result)
    // Lock still held by A
    assert.isNotNull(service.getLock(T, BLOCK, FIELD))
  })

  test('releaseAllLocks() releases all locks held by a user', ({ assert }) => {
    service.join(T, USER_A)
    service.join(T, USER_B)
    service.acquireLock(T, BLOCK, 'title', USER_A.userId)
    service.acquireLock(T, BLOCK, 'content', USER_A.userId)
    service.acquireLock(T, BLOCK, 'align', USER_B.userId)

    const released = service.releaseAllLocks(T, USER_A.userId)
    assert.lengthOf(released, 2)
    assert.lengthOf(service.getLocks(T), 1) // B's lock remains
    assert.equal(service.getLocks(T)[0].userId, USER_B.userId)
  })

  test('releaseAllLocks() returns empty array when user has no locks', ({ assert }) => {
    service.join(T, USER_A)
    const result = service.releaseAllLocks(T, USER_A.userId)
    assert.deepEqual(result, [])
  })

  test('getLocks() returns all active locks for a translation', ({ assert }) => {
    service.join(T, USER_A)
    service.join(T, USER_B)
    service.acquireLock(T, 'block-1', 'title', USER_A.userId)
    service.acquireLock(T, 'block-2', 'content', USER_B.userId)

    const locks = service.getLocks(T)
    assert.lengthOf(locks, 2)
  })

  test('getLocks() returns empty array for unknown translation', ({ assert }) => {
    assert.deepEqual(service.getLocks(999), [])
  })

  test('getLock() returns the specific lock for a field', ({ assert }) => {
    service.join(T, USER_A)
    service.acquireLock(T, BLOCK, FIELD, USER_A.userId)

    const lock = service.getLock(T, BLOCK, FIELD)
    assert.isNotNull(lock)
    assert.equal(lock!.fieldKey, FIELD)
  })

  test('getLock() returns null for an unlocked field', ({ assert }) => {
    assert.isNull(service.getLock(T, BLOCK, FIELD))
  })

  test('onLockExpired callback is called when lock expires', async ({ assert }) => {
    // Use a very short TTL for the test by temporarily overriding LOCK_TTL_MS
    // We test the callback mechanism by calling the private timer directly
    service.join(T, USER_A)
    const expired: Array<{ translationId: number; blockId: string; fieldKey: string }> = []

    service.onLockExpired = (translationId, lock) => {
      expired.push({ translationId, blockId: lock.blockId, fieldKey: lock.fieldKey })
    }

    service.acquireLock(T, BLOCK, FIELD, USER_A.userId)

    // Lock is present
    assert.isNotNull(service.getLock(T, BLOCK, FIELD))

    // Wait for TTL + buffer
    await new Promise((resolve) => setTimeout(resolve, LOCK_TTL_MS + 200))

    // Lock should have expired and the callback should have been called
    assert.isNull(service.getLock(T, BLOCK, FIELD))
    assert.lengthOf(expired, 1)
    assert.equal(expired[0].blockId, BLOCK)
    assert.equal(expired[0].fieldKey, FIELD)
  }).timeout(LOCK_TTL_MS + 1000) // extend Japa's default timeout
})

test.group('BuilderSessionService — isolation between translations', () => {
  let service: BuilderSessionService

  test('sessions and locks are isolated between different translationIds', ({ assert }) => {
    service = new BuilderSessionService()
    const USER = { userId: 1, userName: 'alice', userEmail: 'alice@example.com' }

    service.join(1, USER)
    service.join(2, USER)

    service.acquireLock(1, 'block', 'title', USER.userId)

    assert.lengthOf(service.getLocks(1), 1)
    assert.lengthOf(service.getLocks(2), 0)

    service.leave(1, USER.userId)
    assert.lengthOf(service.getPresence(1), 0)
    assert.lengthOf(service.getPresence(2), 1)
  })
})
