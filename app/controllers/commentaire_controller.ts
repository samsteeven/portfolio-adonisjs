import type { HttpContext } from '@adonisjs/core/http'
import Commentaire from '#models/commentaire'
import {
  createAuthenticatedCommentValidator,
  createGuestCommentValidator,
  addReactionValidator,
  commentFilterValidator,
} from '#validators/commentaire'
import EmojiService from '#services/emoji_service'
import GeolocationService from '#services/geolocalisation/geolocalisation_service'
import { inject } from '@adonisjs/core'
import CommentAuthorization from '#services/bouncer/bouncer_technology_service'

@inject()
export default class CommentairesController {
  constructor(private CommentAuthorizationService: CommentAuthorization) {}

  /**
   * Afficher les commentaires côté admin avec filtres et pagination
   */
  async index({ request, inertia }: HttpContext) {
    const filters = await request.validateUsing(commentFilterValidator)

    const { page = 1, limit = 10 } = filters

    let query = Commentaire.query().preload('user').orderBy('created_at', 'desc')

    const commentaires = await query.paginate(page, limit)

    const serializedCommentaires = commentaires.serialize({
      fields: {
        pick: ['id', 'message', 'reaction', 'commentType', 'displayName', 'createdAt'],
      },
      relations: {
        user: {
          fields: { pick: ['id', 'name', 'email', 'username', 'avatar', 'provider'] },
        },
      },
    })

    // Statistiques pour le dashboard - EXTRAIRE LES VALEURS NUMÉRIQUES
    const [total, authenticated, guests, withReactions, topCountries] = await Promise.all([
      Commentaire.query().count('* as total').first(),
      Commentaire.query().whereNotNull('userId').count('* as total').first(),
      Commentaire.query().whereNull('userId').count('* as total').first(),
      Commentaire.query().whereNotNull('reaction').count('* as total').first(),
      Commentaire.query()
        .whereNotNull('country')
        .groupBy('country', 'countryCode')
        .orderBy('count', 'desc')
        .limit(10)
        .count('* as count')
        .select('country', 'countryCode')
        .exec(),
    ])

    // Convertir les objets Lucid en valeurs simples
    const stats = {
      total: Number(total?.$extras.total) || 0,
      authenticated: Number(authenticated?.$extras.total) || 0,
      guests: Number(guests?.$extras.total) || 0,
      withReactions: Number(withReactions?.$extras.total) || 0,
      topCountries: topCountries.map((country) => ({
        country: String(country.country || ''),
        countryCode: String(
          country.countryCode || country.country?.substring(0, 2).toUpperCase() || ''
        ),
        count: Number(country.$extras.count) || 0,
      })),
    }

    return inertia.render('admin/comments/index', {
      commentaires: serializedCommentaires,
      reactions: EmojiService.getReactionsByType(),
      filters,
      stats,
    })
  }

  /**
   * Créer un nouveau commentaire (utilisateur authentifié)
   */
  async storeAuthenticated({ request, response, auth, session, logger }: HttpContext) {
    const data = await request.validateUsing(createAuthenticatedCommentValidator)
    try {
      const user = auth.user!

      // Récupération des données de géolocalisation
      const locationData = await GeolocationService.getEnhancedLocationData(request)

      await Commentaire.create({
        message: data.message,
        userId: user.id,
        commentType: 'authenticated',

        // Informations de géolocalisation
        ipAddress: locationData.anonymizedIp, // Stocker l'IP anonymisée
        country: locationData.location?.country,
        countryCode: locationData.location?.countryCode,
        region: locationData.location?.region,
        regionName: locationData.location?.regionName,
        city: locationData.location?.city,
        zipCode: locationData.location?.zip,
        latitude: locationData.location?.lat,
        longitude: locationData.location?.lon,
        timezone: locationData.location?.timezone,
        isp: locationData.location?.isp,
        organization: locationData.location?.org,

        // Informations techniques
        userAgent: locationData.userAgent,
        referer: locationData.referer,
      })

      session.flash('success', 'Votre commentaire a été publié avec succès!')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors de la publication du commentaire')
      logger.error('Erreur création commentaire authentifié:', error)
      return response.redirect().back()
    }
  }

  /**
   * Créer un nouveau commentaire (visiteur invité)
   */
  async storeGuest({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(createGuestCommentValidator)
    try {
      // Récupération des données de géolocalisation
      const locationData = await GeolocationService.getEnhancedLocationData(request)

      await Commentaire.create({
        // Informations de l'invité
        ...data,

        // Informations de géolocalisation
        ipAddress: locationData.anonymizedIp,
        country: locationData.location?.country,
        countryCode: locationData.location?.countryCode,
        region: locationData.location?.region,
        regionName: locationData.location?.regionName,
        city: locationData.location?.city,
        zipCode: locationData.location?.zip,
        latitude: locationData.location?.lat,
        longitude: locationData.location?.lon,
        timezone: locationData.location?.timezone,
        isp: locationData.location?.isp,
        organization: locationData.location?.org,

        // Informations techniques
        userAgent: locationData.userAgent,
        referer: locationData.referer,
      })

      session.flash('success', 'Votre message a été publié avec succès! Merci pour votre visite.')
      return response.redirect().back()
    } catch (error) {
      if (error.message === 'Spam détecté') {
        // Ne pas révéler la détection de spam au bot
        return response.redirect().back()
      }

      session.flash('error', 'Erreur lors de la publication de votre message')
      console.error('Erreur création commentaire invité:', error)
      return response.redirect().back()
    }
  }

  /**
   * Ajouter ou modifier une réaction (admin uniquement)
   */
  async addReaction({ params, request, response, bouncer, session }: HttpContext) {
    const authorize = await bouncer.with('CommentairePolicy').allows('addReaction')
    if (!authorize) {
      return this.CommentAuthorizationService.handleUnauthorized(response, session)
    }

    const commentaire = await Commentaire.findOrFail(params.id)
    const data = await request.validateUsing(addReactionValidator)
    try {
      commentaire.reaction = data.reaction || null
      await commentaire.save()

      return response.redirect().back()
    } catch (error) {
      console.error('Erreur ajout réaction:', error)
      return response.redirect().back()
    }
  }

  /**
   * Page Index avec chargement différé
   */
  async indexGuestBook({ inertia, auth }: HttpContext) {
    return inertia.render('guestbook/index', {
      reactions: EmojiService.getReactionsByType(),
      comments: inertia.defer(async () => {
        const comments = await Commentaire.query()
          .preload('user')
          .orderBy('created_at', 'desc')
          .exec()

        return {
          data: comments.map((comment) => ({
            ...comment.serialize({
              fields: {
                pick: [
                  'id',
                  'message',
                  'reaction',
                  'commentType',
                  'displayName',
                  'country',
                  'city',
                  'createdAt',
                ],
              },
              relations: {
                user: {
                  fields: { pick: ['username', 'avatar', 'provider'] },
                },
              },
            }),
            displayName: comment.displayName,
            fullLocation: comment.fullLocation,
          })),
        }
      }),
      user: () => {
        if (auth.use('guestbook').isAuthenticated) {
          return {
            data: auth.use('guestbook').user?.serialize({
              fields: {
                pick: ['username', 'role'],
              },
            }),
            guard: 'guestbook',
          }
        } else if (auth.use('web').isAuthenticated) {
          return {
            data:
              auth.use('web').user?.serialize({
                fields: {
                  pick: ['username', 'role'],
                },
              }) || undefined,
            guard: 'web',
          }
        }
        return undefined
      },
    })
  }

  /**
   * Supprimer un commentaire
   */
  async destroy({ params, response, bouncer, session }: HttpContext) {
    const commentaire = await Commentaire.findOrFail(params.id)
    const authorize = await bouncer.with('CommentairePolicy').allows('delete', commentaire)
    if (!authorize) {
      return this.CommentAuthorizationService.handleUnauthorized(response, session)
    }
    try {
      await commentaire.delete()

      session.flash('success', 'Commentaire supprimé avec succès')
      return response.redirect('/admin/comments')
    } catch (error) {
      session.flash('error', 'Erreur lors de la suppression du commentaire')
      return response.redirect().back()
    }
  }

  /**
   * Voir un commentaire spécifique
   */
  async show({ params, inertia, bouncer, session, response }: HttpContext) {
    const authorize = await bouncer.with('CommentairePolicy').allows('show')
    if (!authorize) {
      return this.CommentAuthorizationService.handleUnauthorized(response, session)
    }
    const commentaire = await Commentaire.query()
      .where('id', params.id)
      .preload('user')
      .firstOrFail()

    return inertia.render('admin/comments/show', {
      commentaire: commentaire.serialize({
        relations: {
          user: {
            fields: { pick: ['id', 'name', 'email', 'username', 'avatar', 'provider'] },
          },
        },
      }),
      reactions: EmojiService.getReactionsByType(),
    })
  }

  /**
   * Obtenir les statistiques géographiques pour le dashboard
   */
  async getGeoStats({ response }: HttpContext) {
    try {
      const countryStats = await Commentaire.query()
        .whereNotNull('country')
        .groupBy('country', 'countryCode')
        .orderBy('count', 'desc')
        .count('* as count')
        .select('country', 'countryCode')
        .limit(10)
        .exec()

      const cityStats = await Commentaire.query()
        .whereNotNull('city')
        .groupBy('city', 'country')
        .orderBy('count', 'desc')
        .count('* as count')
        .select('city', 'country')
        .limit(10)
        .exec()

      return response.json({
        countries: countryStats,
        cities: cityStats,
      })
    } catch (error) {
      return response.status(500).json({ error: 'Erreur lors de la récupération des statistiques' })
    }
  }
}
