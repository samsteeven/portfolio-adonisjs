import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

/**
 * Guest middleware is used to deny access to routes that should
 * be accessed by unauthenticated users.
 *
 * For example, the login page should not be accessible if the user
 * is already logged-in
 */
export default class GuestMiddleware {
  /**
   * The URL to redirect to when user is logged-in
   */
  redirectTo = '/admin/dashboard'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { guards?: (keyof Authenticators)[] } = { guards: ['web', 'guestbook'] }
  ) {
    for (let guard of options.guards || [ctx.auth.defaultGuard]) {
      if (await ctx.auth.use(guard).check()) {
        if (guard === 'guestbook') {
          ctx.session.flash({
            error:
              "Cette action n'est pas possible, Deconnecter vous de mon guestbook et reesayer.",
          })
          return ctx.response.redirect().back()
        }
        return ctx.response.redirect(this.redirectTo, true)
      }
    }

    return next()
  }
}
