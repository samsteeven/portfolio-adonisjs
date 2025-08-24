import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

export default class AuthorizeUserMiddleware {
  async handle(ctx: HttpContext, next: NextFn, action: any) {
    // si la policy attend une ressource, on la charger
    const targetUser = ctx.params.id ? await User.findOrFail(ctx.params.id) : null
    const isAllowed = await ctx.bouncer.with('UserPolicy').allows(action, targetUser)
    if (!isAllowed) {
      ctx.session.flash('error', "Vous n'etes pas autoriser a faire cette action.")
      return ctx.response.redirect().back()
    }
    /**
     * Call next method in the pipeline and return its output
     */
    return next()
  }
}
