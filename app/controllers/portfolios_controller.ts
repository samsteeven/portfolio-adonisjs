import type { HttpContext } from '@adonisjs/core/http'
import PortfolioService from '#services/portfolio_service'

export default class PortfoliosController {
  /**
   * Page d'accueil du portfolio
   */
  async index({ inertia }: HttpContext) {
    return inertia.render('home', {
      // Technologies pour le composant Skills
      technologies: inertia.defer(() => PortfolioService.getTechnologies()),

      // Compétences/Expériences pour le composant Experiences
      skills: await PortfolioService.getSkills(),

      // Projets pour le composant ProjectList
      projects: await PortfolioService.getProjects(),

      // Articles récents pour le composant RecentPosts
      recentPosts: inertia.defer(() => PortfolioService.getRecentPosts(5)),
    })
  }

  /**
   * Page de détail d'un projet
   */
  async projectShow({ params, inertia }: HttpContext) {
    const project = await PortfolioService.getProjectBySlug(params.slug)

    return inertia.render('ProjectDetails', {
      project,
    })
  }
}
