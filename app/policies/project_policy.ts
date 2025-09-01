import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { UserRole } from '#enums/user_role'

export default class ProjectPolicy extends BasePolicy {
  /**
   * Only admins and super admins can create projects
   */
  create(user: User): AuthorizerResponse {
    return user.role === UserRole.ADMIN
  }

  /**
   * Only admins and super admins can update projects
   */
  update(user: User): AuthorizerResponse {
    return user.role === UserRole.ADMIN
  }

  /**
   * Only admins and super admins can delete projects
   */
  delete(user: User): AuthorizerResponse {
    return user.role === UserRole.ADMIN
  }

  /**
   * Only admins and super admins can toggle project status
   */
  toggle(user: User): AuthorizerResponse {
    return user.role === UserRole.ADMIN
  }
}
