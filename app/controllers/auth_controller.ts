import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/auth'

export default class AuthController {
  async showLogin({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  async login({ request, response, auth, session }: HttpContext) {
    const { email, password, rememberMe } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user, rememberMe)
    try {
      return response.redirect().toRoute('dashboard')
    } catch (error) {
      session.flashErrors({
        password: 'Email ou mot de passe invalide',
      })
      return response.redirect().back()
    }
  }

  async logout({ response, auth }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('home')
  }
}
