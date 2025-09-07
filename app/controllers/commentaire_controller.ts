import type { HttpContext } from '@adonisjs/core/http'
import Commentaire from '#models/commentaire'
import { createCommentaireValidator, addReactionValidator } from '#validators/commentaire'
import EmojiService from '#services/emoji_service'
import { inject } from '@adonisjs/core'
import CommentAuthorization from '#services/bouncer_technology_service'

@inject()
export default class CommentairesController {
  constructor(private CommentAuthorizationService: CommentAuthorization) {}
  /**
   * Afficher les commentaires côté admin avec filtres et pagination
   */
  async index({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')
    const hasReaction = request.input('hasReaction', '')

    let query = Commentaire.query().preload('user')

    // Filtre de recherche
    if (search) {
      query = query.where((builder) => {
        builder.orWhere('message', 'like', `%${search}%`).orWhereHas('user', (userQuery) => {
          userQuery.where('name', 'like', `%${search}%`).orWhere('email', 'like', `%${search}%`)
        })
      })
    }

    // Filtre par réaction
    if (hasReaction === 'true') {
      query = query.whereNotNull('reaction')
    } else if (hasReaction === 'false') {
      query = query.whereNull('reaction')
    }

    // Tri par date de création (plus récents en premier)
    query = query.orderBy('created_at', 'desc')

    // Pagination
    const commentaires = await query.paginate(page, 10)

    // Sérialiser les données pour Inertia
    const serializedCommentaires = commentaires.serialize({
      fields: {
        pick: ['id', 'message', 'reaction', 'userId', 'createdAt', 'updatedAt'],
      },
      relations: {
        user: {
          fields: ['id', 'name', 'email', 'avatar', 'provider'],
        },
      },
    })

    return inertia.render('admin/comments/index', {
      commentaires: serializedCommentaires,
      reactions: EmojiService.getReactionsByType(),
      filters: {
        search,
        hasReaction,
      },
    })
  }

  /**
   * Créer un nouveau commentaire (nécessite d'être connecté)
   */
  async store({ request, response, auth, session }: HttpContext) {
    const data = await request.validateUsing(createCommentaireValidator)
    try {
      const user = auth.user!

      const commentaire = await Commentaire.create({
        message: data.message,
        userId: user.id,
      })

      await commentaire.load('user')

      session.flash('success', 'Votre commentaire a été publié avec succès!')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors de la publication du commentaire')
      console.log(error)
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
    try {
      const commentaire = await Commentaire.findOrFail(params.id)
      const data = await request.validateUsing(addReactionValidator)

      // Si reaction est null ou vide, on supprime la réaction
      commentaire.reaction = data.reaction || null
      await commentaire.save()

      return response.redirect().back()
    } catch (error) {
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
          .limit(10)
          .exec()
        return { data: comments }
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
   * Supprimer un commentaire (admin uniquement)
   */
  async destroy({ params, response, bouncer, session }: HttpContext) {
    try {
      const commentaire = await Commentaire.findOrFail(params.id)
      const authorize = await bouncer.with('CommentairePolicy').allows('delete', commentaire)
      if (!authorize) {
        return this.CommentAuthorizationService.handleUnauthorized(response, session)
      }
      await commentaire.delete()

      session.flash('error', 'Commentaire supprimé avec succès')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors de la suppression du commentaire')
      return response.redirect().back()
    }
  }

  /**
   * Voir un commentaire spécifique
   */
  async show({ params, inertia }: HttpContext) {
    const commentaire = await Commentaire.query()
      .where('id', params.id)
      .preload('user')
      .firstOrFail()

    return inertia.render('admin/comments/show', {
      commentaire: commentaire.serialize({
        relations: {
          user: {
            fields: ['id', 'name', 'email', 'avatar', 'provider'],
          },
        },
      }),
      reactions: EmojiService.getReactionsByType(),
    })
  }
}
