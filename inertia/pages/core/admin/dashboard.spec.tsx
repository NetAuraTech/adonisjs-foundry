// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { ReactNode } from 'react'
import type { Data } from '@generated/data'
import type { AdminDashboardTranslations } from '#types/translations'
import DashboardPage from '~/pages/core/admin/dashboard'

/**
 * Conditional-rendering seam for the admin dashboard page: every section
 * renders when its key is present in the payload and disappears when it is
 * not — the contract that lets a pruned flavor drop a domain without
 * leaving empty figures behind.
 *
 * Inertia's server-provided context (page props, Head manager, Tuyau Link
 * routes) is substituted with narrow mocks; atoms, guards and the
 * translation hook run for real.
 */

const { mockPageProps } = vi.hoisted(() => ({
  mockPageProps: {
    props: {
      locale: 'en',
      currentUser: {
        permissions: ['users.view', 'pages.view', 'templates.view', 'files.view'],
        role: { slug: 'admin' },
      },
    },
  },
}))

vi.mock('@inertiajs/react', () => ({
  usePage: () => mockPageProps,
  Head: () => null,
}))

vi.mock('@adonisjs/inertia/react', () => ({
  Link: ({ children }: { children?: ReactNode }) => <a>{children}</a>,
}))

vi.mock('~/layouts/admin', () => ({
  default: ({ children }: { children?: ReactNode }) => children,
}))
;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

const translations: AdminDashboardTranslations = {
  title: 'Dashboard',
  cards: {
    users: 'Users',
    pages: 'Pages',
    translations: 'Page translations',
    files: 'Files',
    templates: 'Templates',
    published_locales: 'Published locales',
    folders: 'Folders',
    no_role: 'No role',
  },
  status: { draft: 'Draft', published: 'Published', archived: 'Archived' },
  recent: {
    published_pages: 'Recently published',
    uploads: 'Recent uploads',
    empty: 'Nothing to display yet.',
  },
  view_all: 'View all',
}

const fullStats: Data.Dashboard = {
  auth: {
    users: 2,
    usersByRole: [
      { name: 'admin', count: 1 },
      { name: null, count: 1 },
    ],
  },
  page: {
    pages: 3,
    pageTranslations: { draft: 1, published: 2, archived: 0, total: 3 },
    publishedLocales: 2,
    recentPublishedPages: [
      {
        id: 11,
        pageId: 1,
        title: 'Welcome',
        slug: 'welcome',
        locale: 'en',
        publishedAt: '2026-08-01T10:00:00.000Z',
      },
    ],
  },
  template: { templates: 4 },
  file: {
    files: 5,
    fileFolders: 2,
    filesByFolder: [{ id: 7, name: 'banners', count: 5 }],
    recentFiles: [
      {
        id: 21,
        originalName: 'hero.png',
        mimeType: 'image/png',
        size: 1024,
        createdAt: '2026-08-02T10:00:00.000Z',
      },
    ],
  },
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})

async function render(stats: Data.Dashboard): Promise<string> {
  await act(async () => {
    root.render(<DashboardPage stats={stats} translations={translations} />)
  })
  return container.textContent ?? ''
}

describe('DashboardPage', () => {
  it('renders every section when all keys are present', async () => {
    const content = await render(fullStats)

    // Auth section.
    expect(content).toContain('Users')
    expect(content).toContain('1 admin')
    expect(content).toContain('1 No role')
    // Page section, pixel-faithful label-first lines.
    expect(content).toContain('Page translations: 3')
    expect(content).toContain('2 Published')
    expect(content).toContain('1 Draft')
    expect(content).toContain('0 Archived')
    expect(content).toContain('Published locales: 2')
    // Template section (rendered inside the pages card).
    expect(content).toContain('Templates: 4')
    // File section.
    expect(content).toContain('Folders: 2')
    expect(content).toContain('5 banners')
    // Recent-activity lists.
    expect(content).toContain('Recently published')
    expect(content).toContain('Welcome')
    expect(content).toContain('Recent uploads')
    expect(content).toContain('hero.png')
  })

  it('renders only the sections whose key is present', async () => {
    const { auth: _auth, file: _file, ...partialStats } = fullStats
    const content = await render(partialStats)

    expect(content).toContain('Page translations: 3')
    expect(content).toContain('Templates: 4')
    expect(content).toContain('Recently published')
    // Auth and file sections leave nothing behind.
    expect(content).not.toContain('Users')
    expect(content).not.toContain('Folders:')
    expect(content).not.toContain('Recent uploads')
    expect(content).not.toContain('hero.png')
  })

  it('renders the template section without the page section', async () => {
    const { auth: _auth, page: _page, file: _file, ...templateOnly } = fullStats
    const content = await render(templateOnly)

    // The template section stands on its own key, not on the page one.
    expect(content).toContain('Templates')
    expect(content).not.toContain('Page translations')
    expect(content).not.toContain('Recently published')
  })

  it('renders the page shell without figures when no key is present', async () => {
    const content = await render({})

    expect(content).toContain('Dashboard')
    expect(content).not.toContain('Page translations')
    expect(content).not.toContain('Folders:')
    expect(content).not.toContain('Recently published')
    expect(content).not.toContain('Recent uploads')
    expect(content).not.toContain('Nothing to display yet.')
  })
})
