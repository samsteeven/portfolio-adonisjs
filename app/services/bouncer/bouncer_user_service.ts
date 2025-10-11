import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { UserService } from '#services/user_service'

export interface AuthorizationResult {
  authorized: boolean
  user?: any
  error?: string
}

@inject()
export default class BouncerUserService {
  constructor(private userService: UserService) {}

  /**
   * Vérifie l'autorisation pour créer un utilisateur
   */
  async canStoreUser(bouncer: HttpContext['bouncer']): Promise<AuthorizationResult> {
    try {
      await bouncer.with('UserPolicy').authorize('store')
      return { authorized: true }
    } catch (error) {
      return {
        authorized: false,
        error: 'Non autorisé à créer un utilisateur',
      }
    }
  }
  async canShowUser(
    bouncer: HttpContext['bouncer'],
    userId: string | number
  ): Promise<AuthorizationResult> {
    try {
      const targetUser = await this.userService.getUserById(userId)
      await bouncer.with('UserPolicy').authorize('show', targetUser)

      return {
        authorized: true,
      }
    } catch (error) {
      return {
        authorized: false,
        error: 'Non autorisé à afficher cet utilisateur',
      }
    }
  }

  /**
   * Vérifie l'autorisation pour mettre à jour un utilisateur
   */
  async canUpdateUser(
    bouncer: HttpContext['bouncer'],
    userId: string | number
  ): Promise<AuthorizationResult> {
    try {
      const targetUser = await this.userService.getUserById(userId)
      await bouncer.with('UserPolicy').authorize('update', targetUser)

      return {
        authorized: true,
      }
    } catch (error) {
      return {
        authorized: false,
        error: 'Non autorisé à modifier cet utilisateur',
      }
    }
  }

  /**
   * Vérifie l'autorisation pour supprimer un utilisateur
   */
  async canDestroyUser(
    bouncer: HttpContext['bouncer'],
    userId: string | number
  ): Promise<AuthorizationResult> {
    try {
      const targetUser = await this.userService.getUserById(userId)
      await bouncer.with('UserPolicy').authorize('destroy', targetUser)

      return {
        authorized: true,
      }
    } catch (error) {
      return {
        authorized: false,
        error: 'Non autorisé à supprimer cet utilisateur',
      }
    }
  }

  /**
   * Vérifie l'autorisation pour une action personnalisée
   */
  async canPerformAction(
    bouncer: HttpContext['bouncer'],
    action: any,
    userId?: string | number,
    resourceData?: any
  ): Promise<AuthorizationResult> {
    try {
      let targetUser = null

      if (userId) {
        targetUser = await this.userService.getUserById(userId)
      }

      if (targetUser || resourceData) {
        await bouncer.with('UserPolicy').authorize(action, targetUser || resourceData)
      } else {
        await bouncer.with('UserPolicy').authorize(action)
      }

      return {
        authorized: true,
        user: targetUser,
      }
    } catch (error) {
      return {
        authorized: false,
        error: `Non autorisé à effectuer l'action: ${action}`,
      }
    }
  }

  /**
   * Méthode helper pour gérer les réponses d'autorisation
   */
  handleUnauthorized(
    response: HttpContext['response'],
    session: HttpContext['session'],
    error: string = 'Accès non autorisé'
  ) {
    session.flash('error', error)
    return response.redirect().back()
  }
}
