import { ReactElement, useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'
import { Head, usePage } from '@inertiajs/react'
import type { SharedProps } from '@adonisjs/inertia/types'
import { useIsLarge } from '~/hooks/use_is_large'
import { AdminSidebar } from '~/components/organisms/admin/admin_sidebar'
import { AdminHeader } from '~/components/organisms/admin/admin_header'

interface LayoutProps {
  children: ReactElement<SharedProps>
}

export default function Layout(props: LayoutProps) {
  const isLarge = useIsLarge()
  const pageProps = usePage<SharedProps>().props
  const { children } = props

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNavButtonClick = () => {
    setSidebarOpen(!sidebarOpen)

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  const closeMenu = () => {
    setSidebarOpen(false)

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  useEffect(() => {
    setSidebarOpen(isLarge)
  }, [isLarge])

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
    <>
      <Head>
        <meta name="csrf-token" content={pageProps.csrfToken} />
      </Head>
      <Toaster position="top-right" richColors />
      <div className="admin">
        <AdminSidebar sidebarOpen={sidebarOpen} setIsMenuOpen={setSidebarOpen} />
        <div className="main">
          <AdminHeader handleClick={handleNavButtonClick} />
          <main>{children}</main>
        </div>
        {sidebarOpen && (
          <div
            className="block lg:hidden fixed inset-0 bg-neutral-900 opacity-50 z-49"
            onClick={() => closeMenu()}
          />
        )}
      </div>
    </>
  )
}
