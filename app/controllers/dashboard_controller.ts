import { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  async index({ inertia }: HttpContext) {
    return inertia.render('admin/dashboard')
  }
  async projectShow({ params, inertia }: HttpContext) {
    return inertia.render('ProjectDetails', { slug: params.slug })
  }
}
