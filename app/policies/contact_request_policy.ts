import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { UserRole } from '#enums/user_role'

export default class ContactRequestPolicy extends BasePolicy {
  /**
   * Vérifier si l'utilisateur peut voir les demandes de contact
   */
  view(user: User): AuthorizerResponse {
    // Seuls les admins peuvent voir les demandes de contact
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut voir une demande de contact spécifique
   */
  show(user: User): AuthorizerResponse {
    // Seuls les admins peuvent voir une demande de contact spécifique
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut mettre à jour le statut d'une demande de contact
   */
  updateStatus(user: User): AuthorizerResponse {
    // Seuls les admins peuvent mettre à jour le statut
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut répondre à une demande de contact
   */
  reply(user: User): AuthorizerResponse {
    // Seuls les admins peuvent répondre aux demandes de contact
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut supprimer une demande de contact
   */
  destroy(user: User): AuthorizerResponse {
    // Seuls les admins peuvent supprimer les demandes de contact
    return user.role === UserRole.ADMIN
  }

  /**
   * Vérifier si l'utilisateur peut marquer plusieurs demandes comme lues
   */
  bulkUpdate(user: User): AuthorizerResponse {
    // Seuls les admins peuvent faire des mises à jour en masse
    return user.role === UserRole.ADMIN
  }
}