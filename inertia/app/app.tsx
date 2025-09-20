import React, { StrictMode } from 'react'
import { createInertiaApp } from '@inertiajs/react'
import { hydrateRoot } from 'react-dom/client'
import RootLayout from '~/layout/RootLayout'

createInertiaApp({
  progress: { color: '#22D3EE' },
  resolve: (name) => {
    // Chargement dynamique de tes pages
    const pages = import.meta.glob('../pages/**/*.tsx', { eager: true })
    const page: any = pages[`../pages/${name}.tsx`]
    // Applique le layout par défaut si la page n'en a pas
    page.default.layout =
      page.default.layout ||
      ((page: React.ReactNode) => (
        <StrictMode>
          <RootLayout>{page}</RootLayout>
        </StrictMode>
      ))
    return page
  },
  setup({ el, App, props }) {
    hydrateRoot(el, <App {...props} />)
  },
}).then()
