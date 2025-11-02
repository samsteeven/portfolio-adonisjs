import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import Commentaire from '#models/commentaire'
import NewsletterSubscriber from '#models/newsletter_suscriber'
import PortfolioService from '#services/portfolio_service'

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
    // Partager les données du propriétaire du portfolio (globales)
    portfolioOwner: async () => await PortfolioService.getPortfolioOwnerData(),
    githubStats: async () => await PortfolioService.getRepoStats(),
    auth: async (ctx) => {
      const user = ctx.auth.use('web').user
      let usersCount = null
      let commentsCount = null
      let subscribersCount = null
      if (user) {
        // Récupérez le nombre total d'utilisateurs
        usersCount = await User.query().count('* as total')
        usersCount = usersCount[0].$extras.total
        await user.load('subInfo')

        commentsCount = await Commentaire.query().count('* as total')
        commentsCount = commentsCount[0].$extras.total

        subscribersCount = await NewsletterSubscriber.query().count('* as total')
        subscribersCount = subscribersCount[0].$extras.total
      }
      return {
        user,
        usersCount: usersCount || undefined,
        commentsCount: commentsCount || undefined,
        subscribersCount: subscribersCount || undefined,
      }
    },
    error: (ctx) => ctx.session.flashMessages.get('error'),
    success: (ctx) => ctx.session.flashMessages.get('success'),
    newsletterSuccess: (ctx) => ctx.session.flashMessages.get('newsletterSuccess'),
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
