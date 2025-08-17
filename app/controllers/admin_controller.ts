import { HttpContext } from '@adonisjs/core/http'

export default class AdminController {
  async profile({ inertia }: HttpContext) {
    return inertia.render('admin/profile')
  }
}
