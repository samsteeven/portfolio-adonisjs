// app/middleware/admin_role_middleware.ts

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { UserRole } from '#enums/user_role'

export default class AdminRoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.redirect().toRoute('auth.login')
    }

    if (user.role !== UserRole.ADMIN) {
      return ctx.response.abort('Accès refusé. Droits administrateur requis.', 403)
    }

    /**
     * Call next method in the pipeline and return its output
     */
    await next()
  }
}
