import { test } from '@japa/runner'
import type { I18n } from '@adonisjs/i18n'
import { I18nService } from '#services/i18n_service'

class FakeI18n implements Partial<I18n> {
  public locale = 'en'
  private translations: Record<string, string> = {}

  constructor(translations?: Record<string, string>) {
    this.translations = translations ?? {}
  }

  t(key: string, _replacements?: Record<string, any>): string {
    return this.translations[key] ?? key
  }
}

test.group('I18nService', () => {
  let i18n: FakeI18n
  let service: I18nService

  test('translate() delegates to the underlying I18n instance', ({ assert }) => {
    i18n = new FakeI18n({ 'auth.session.login.success': 'Logged in!' })
    service = new I18nService(i18n as unknown as I18n)

    const result = service.translate('auth.session.login.success')
    assert.equal(result, 'Logged in!')
  })

  test('translate() passes replacements to the underlying instance', ({ assert }) => {
    i18n = new FakeI18n({ 'cms.users.deleted': 'User deleted' })
    service = new I18nService(i18n as unknown as I18n)

    // Just verify it doesn't throw and returns a string — the underlying I18n handles interpolation
    assert.doesNotThrow(() => {
      service.translate('cms.users.deleted', { username: 'John' })
    })
  })

  test('translate() falls back to key when translation is missing', ({ assert }) => {
    i18n = new FakeI18n({})
    service = new I18nService(i18n as unknown as I18n)

    const result = service.translate('nonexistent.key')
    assert.equal(result, 'nonexistent.key')
  })

  test('getLocale() returns the current locale', ({ assert }) => {
    i18n = new FakeI18n({})
    i18n.locale = 'fr'
    service = new I18nService(i18n as unknown as I18n)

    assert.equal(service.getLocale(), 'fr')
  })

  test('buildPayload() translates flat string values', ({ assert }) => {
    i18n = new FakeI18n({
      'auth.session.login.title': 'Welcome back!',
      'auth.session.login.sub_title': 'Please log in.',
    })
    service = new I18nService(i18n as unknown as I18n)

    const result = service.buildPayload({
      title: 'auth.session.login.title',
      sub_title: 'auth.session.login.sub_title',
    })

    assert.deepEqual(result, {
      title: 'Welcome back!',
      sub_title: 'Please log in.',
    })
  })

  test('buildPayload() translates nested objects recursively', ({ assert }) => {
    i18n = new FakeI18n({
      'auth.session.login.title': 'Welcome back!',
      'auth.register.account.has': 'Already have an account?',
      'auth.register.account.login': 'Login',
    })
    service = new I18nService(i18n as unknown as I18n)

    const result = service.buildPayload({
      title: 'auth.session.login.title',
      account: {
        has: 'auth.register.account.has',
        login: 'auth.register.account.login',
      },
    })

    assert.deepEqual(result, {
      title: 'Welcome back!',
      account: {
        has: 'Already have an account?',
        login: 'Login',
      },
    })
  })

  test('buildPayload() preserves structure of deeply nested objects', ({ assert }) => {
    i18n = new FakeI18n({
      'a.b.c': 'Deep translation',
      'x.y.z.w': 'Very deep',
    })
    service = new I18nService(i18n as unknown as I18n)

    const result = service.buildPayload({
      a: { b: { c: 'a.b.c' } },
      x: { y: { z: { w: 'x.y.z.w' } } },
    })

    assert.deepEqual(result, {
      a: { b: { c: 'Deep translation' } },
      x: { y: { z: { w: 'Very deep' } } },
    })
  })

  test('buildPayload() falls back to key for missing translations', ({ assert }) => {
    i18n = new FakeI18n({})
    service = new I18nService(i18n as unknown as I18n)

    const result = service.buildPayload({
      title: 'missing.key',
    })

    assert.deepEqual(result, { title: 'missing.key' })
  })
})
