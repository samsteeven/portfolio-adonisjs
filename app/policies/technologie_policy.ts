import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { UserRole } from '#enums/user_role'

export default class TechnologyPolicy extends BasePolicy {
  /**
   * Vérifier si l'utilisateur peut créer une technologie
   */
  create(user: User): AuthorizerResponse {
    // Seuls les admins peuvent créer des technologies
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut créer une technologie (alias pour create)
   */
  store(user: User): AuthorizerResponse {
    return this.create(user)
  }

  /**
   * Vérifier si l'utilisateur peut modifier une technologie
   */
  edit(user: User): AuthorizerResponse {
    // Seuls les admins peuvent modifier les technologies
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut mettre à jour une technologie
   */
  update(user: User): AuthorizerResponse {
    // Seuls les admins peuvent mettre à jour les technologies
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut supprimer une technologie
   */
  destroy(user: User): AuthorizerResponse {
    // Seuls les admins peuvent supprimer les technologies
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut importer des données
   */
  import(user: User): AuthorizerResponse {
    // Seuls les admins peuvent importer
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut gérer les catégories
   */
  manageCategories(user: User): AuthorizerResponse {
    // Seuls les admins peuvent gérer les catégories
    return user.role === UserRole.ADMIN
  }
}
