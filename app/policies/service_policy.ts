import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { UserRole } from '#enums/user_role'

export default class ServicePolicy extends BasePolicy {
  /**
   * Vérifier si l'utilisateur peut créer un service
   */
  create(user: User): AuthorizerResponse {
    // Seuls les admins peuvent créer des services
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut créer un service (alias pour create)
   */
  store(user: User): AuthorizerResponse {
    return this.create(user)
  }

  /**
   * Vérifier si l'utilisateur peut modifier un service
   */
  edit(user: User): AuthorizerResponse {
    // Seuls les admins peuvent modifier les services
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut mettre à jour un service
   */
  update(user: User): AuthorizerResponse {
    // Seuls les admins peuvent mettre à jour les services
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut supprimer un service
   */
  destroy(user: User): AuthorizerResponse {
    // Seuls les admins peuvent supprimer les services
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut dupliquer un service
   */
  duplicate(user: User): AuthorizerResponse {
    // Seuls les admins peuvent dupliquer les services
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut réorganiser les services
   */
  reorder(user: User): AuthorizerResponse {
    // Seuls les admins peuvent réorganiser les services
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut activer/désactiver un service
   */
  toggleStatus(user: User): AuthorizerResponse {
    // Seuls les admins peuvent activer/désactiver les services
    return user.role === UserRole.ADMIN
  }
}