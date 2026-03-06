import { client } from '~/client'
import { ReactElement } from 'react'
import Layout from '~/layouts/default'
import { Data } from '@generated/data'
import ReactDOMServer from 'react-dom/server'
import { createInertiaApp } from '@inertiajs/react'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import i18n from '~/lib/i18n'

export default function render(page: any) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      return resolvePageComponent(
        `./pages/${name}.tsx`,
        import.meta.glob('./pages/**/*.tsx', { eager: true }),
        (page: ReactElement<Data.SharedProps>) => <Layout children={page} />
      )
    },
    setup: ({ App, props }) => {
      const locale = String(props.initialPage.props.locale || 'en')
      i18n.changeLanguage(locale)

      return (
        <TuyauProvider client={client}>
          <App {...props} />
        </TuyauProvider>
      )
    },
  })
}
