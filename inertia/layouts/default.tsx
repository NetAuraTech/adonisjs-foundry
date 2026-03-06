import { ReactElement, useEffect } from 'react'
import { Header } from '~/components/organisms/header'
import { Footer } from '~/components/organisms/footer'
import { toast, Toaster } from 'sonner'
import { usePage } from '@inertiajs/react'
import type { SharedProps } from '@adonisjs/inertia/types'

interface LayoutProps {
  children: ReactElement<SharedProps>
}

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
    <div
      id="page-wrapper"
    >
      <Header />
      <Toaster position="top-right" richColors  />
      {children}
      <Footer/>
    </div>
  )
}
