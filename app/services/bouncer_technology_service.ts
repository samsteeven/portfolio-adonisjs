import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import type Technology from '#models/technology'

export interface TechnologyAuthorizationResult {
  authorized: boolean
  technology?: Technology
  error?: string
}

@inject()
export default class TechnologyAuthorizationService {
  /**
   * Vérifie l'autorisation pour créer une technologie
   */
  async canCreateTechnology(
    bouncer: HttpContext['bouncer']
  ): Promise<TechnologyAuthorizationResult> {
    try {
      await bouncer.with('TechnologyPolicy').authorize('create')
      return { authorized: true }
    } catch (error) {
      return {
        authorized: false,
        error: 'Non autorisé à créer des technologies',
      }
    }
  }

  /**
   * Vérifie l'autorisation pour modifier une technologie
   */
  async canUpdateTechnology(
    bouncer: HttpContext['bouncer']
  ): Promise<TechnologyAuthorizationResult> {
    try {
      await bouncer.with('TechnologyPolicy').authorize('update')

      return {
        authorized: true,
      }
    } catch (error) {
      return {
        authorized: false,
        error: 'Non autorisé à modifier cette technologie',
      }
    }
  }

  /**
   * Vérifie l'autorisation pour supprimer une technologie
   */
  async canDeleteTechnology(
    bouncer: HttpContext['bouncer']
  ): Promise<TechnologyAuthorizationResult> {
    try {
      await bouncer.with('TechnologyPolicy').authorize('destroy')

      return {
        authorized: true,
      }
    } catch (error) {
      return {
        authorized: false,
        error: 'Non autorisé à supprimer cette technologie',
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
