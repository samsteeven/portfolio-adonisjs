import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { UserRole } from '#enums/user_role'
import string from '@adonisjs/core/helpers/string'

export default class AlliesController {
  async redirect({ ally, params, response, session }: HttpContext) {
    try {
      return ally.use(params.provider).redirect()
    } catch (error) {
      session.flash('error', 'Erreur de redirection, reesayer')
      return response.redirect('/guestbook')
    }
  }

  async callback({ ally, response, auth, params, session, logger }: HttpContext) {
    try {
      const oauth = ally.use(params.provider)
      if (oauth.accessDenied()) {
        session.flash('error', 'Accès refusé')
        return response.redirect('/guestbook')
      }

      if (oauth.stateMisMatch()) {
        session.flash('error', 'Problème de sécurité : état invalide')
        return response.redirect('/guestbook')
      }

      if (oauth.hasError()) {
        session.flash('error', `Erreur d'authentification: ${oauth.getError()}`)
        return response.redirect('/guestbook')
      }

      const oauthUser = await oauth.user()

      if (!oauthUser.email) {
        session.flash('error', 'Email requis pour la connexion')
        return response.redirect('/guestbook')
      }

      // Créer ou récupérer l'utilisateur
      const dbUser = await User.firstOrCreate(
        { email: oauthUser.email },
        {
          username: oauthUser.name || oauthUser.nickName || 'Utilisateur',
          email: oauthUser.email,
          provider: params.provider,
          password: string.generateRandom(32),
        }
      )

      // Mettre à jour les infos utilisateur si nécessaire
      if (oauthUser.avatarUrl) {
        await dbUser.related('subInfo').updateOrCreate(
          { userId: dbUser.id },
          {
            photoPath: oauthUser.avatarUrl,
          }
        )
      }

      dbUser.role !== UserRole.ADMIN
        ? await auth.use('guestbook').login(dbUser)
        : await auth.use('web').login(dbUser)

      session.flash('success', `Vous etes connecté sur mon guestbook via ${params.provider}`)
      return response.redirect('/guestbook')
    } catch (error) {
      logger.error('Erreur OAuth:', error)
      session.flash('error', 'Erreur lors de la connexion, reesayer')
      return response.redirect('/guestbook')
    }
  }
}
