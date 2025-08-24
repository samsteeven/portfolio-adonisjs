import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class IsActiveUserMiddleware {
  async handle({ auth, response, session }: HttpContext, next: NextFn) {
    if (auth.user && !auth.user.isActive) {
      session.flash('errors', "Votre compte n'est pas actif. Veuillez contacter  l'administrateur.")
      await auth.use('web').logout()
      return response.redirect().toRoute('home')
    }
    return next()
  }
}
