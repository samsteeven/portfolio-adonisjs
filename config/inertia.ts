import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import Project from '#models/project'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: ({ request }: HttpContext) => {
    if (request.url().startsWith('/admin')) {
      return 'admin_layout'
    }
    return 'inertia_layout'
  },

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    auth: async (ctx) => {
      const user = ctx.auth.use('web').user
      let usersCount = null
      let projectsCount = null
      if (user) {
        // Récupérez le nombre total d'utilisateurs
        usersCount = await User.query().count('* as total')
        usersCount = usersCount[0].$extras.total

        projectsCount = await Project.query().count('* as total')
        projectsCount = projectsCount[0].$extras.total

        await user.load('subInfo')
      }
      return {
        user,
        usersCount: usersCount || undefined,
        projectsCount: projectsCount || undefined,
      }
    },
    error: (ctx) => ctx.session.flashMessages.get('error'),
    success: (ctx) => ctx.session.flashMessages.get('success'),
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: true,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
