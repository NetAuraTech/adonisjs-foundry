import { ReactElement, useEffect } from 'react'
import { Header } from '~/components/organisms/header'
import { Footer } from '~/components/organisms/footer'
import { toast, Toaster } from 'sonner'
import { usePage } from '@inertiajs/react'
import type { SharedProps } from '@adonisjs/inertia/types'

interface LayoutProps {
  children: ReactElement<SharedProps>
}

/**
 * Root layout for all public-facing pages.
 *
 * Wraps page content in the `#page-wrapper` flex-column container with a
 * persistent `<Header>` at the top and a `<Footer>` pinned to the bottom via
 * `mt-auto`. A `<Toaster>` is mounted at top-right to surface flash messages
 * passed via Inertia shared props (`flash.error`, `flash.success`, `flash.info`).
 *
 * **Flash messages** are displayed as `sonner` toast notifications and
 * automatically dismissed on every Inertia navigation so stale messages never
 * carry over to the next page.
 *
 * @example
 * // Attached to a public page component
 * LoginPage.layout = (page) => <Layout>{page}</Layout>
 *
 * // Or used as the default layout in the Inertia setup
 * createInertiaApp({
 *   resolve: (name) => {
 *     const page = pages[name]
 *     page.layout ??= (page) => <Layout>{page}</Layout>
 *     return page
 *   }
 * })
 */
export default function Layout(props: LayoutProps) {
  const { children } = props

  useEffect(() => {
    toast.dismiss()
  }, [usePage().url])

  if (children.props.flash.error) {
    toast.error(children.props.flash.error)
  }

  if (children.props.flash.success) {
    toast.success(children.props.flash.success)
  }

  if (children.props.flash.info) {
    toast.info(children.props.flash.info)
  }

  return (
    <div id="page-wrapper">
      <Header />
      <Toaster position="top-right" richColors />
      {children}
      <Footer />
    </div>
  )
}
