import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { UserRole } from '#enums/user_role'

export default class UserPolicy extends BasePolicy {
  // Créer un utilisateur
  store(user: User): AuthorizerResponse {
    return user.role === UserRole.ADMIN
  }

  // Modifier un utilisateur (soi-même ou admin)
  update(user: User, targetUser: User): AuthorizerResponse {
    return user.id === targetUser.id || user.role === UserRole.ADMIN
  }

  // Supprimer un utilisateur (admin peut supprimer uniquement les visiteurs)
  destroy(user: User, targetUser: User): AuthorizerResponse {
    return user.role === UserRole.ADMIN && targetUser.role === UserRole.VISITOR
  }

  // Modifier le rôle (seulement admin)
  changeRole(user: User): AuthorizerResponse {
    // Seul un admin peut modifier un rôle
    return user.role === UserRole.ADMIN
  }

  // Activer/désactiver un utilisateur (admin, et pas soi-même)
  toggleStatus(user: User, targetUser: User): AuthorizerResponse {
    return user.role === UserRole.ADMIN && user.id !== targetUser.id
  }
}
