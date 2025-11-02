import { defineConfig } from 'vite'
import { getDirname } from '@adonisjs/core/helpers'
import inertia from '@adonisjs/inertia/client'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    inertia({ ssr: { enabled: true, entrypoint: 'inertia/app/ssr.tsx' } }),
    react(),
    adonisjs({
      entrypoints: ['inertia/app/app.tsx'],
      reload: ['resources/views/**/*.edge', '!resources/views/emails/**'],
    }),
    tailwind(),
  ],

  resolve: {
    alias: {
      '~/': `${getDirname(import.meta.url)}/inertia/`,
      '@': `${getDirname(import.meta.url)}/inertia/lib`,
    },
  },

  // Important pour éviter le require(esm) de GSAP en SSR
  ssr: {
    noExternal: ['gsap', '@gsap/react', 'gsap/*'],
  },

  // Optionnel: évite la pré-optimisation côté dev qui peut casser GSAP
  optimizeDeps: {
    exclude: ['gsap', '@gsap/react'],
  },
})
