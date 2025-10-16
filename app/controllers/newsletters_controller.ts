import NewsletterSubscriber from '#models/newsletter_suscriber'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import vine from '@vinejs/vine'
import { errors as mailErrors } from '@adonisjs/mail'
import db from '@adonisjs/lucid/services/db'
import queue from '@rlanz/bull-queue/services/main'
import NewsletterJob from '#jobs/newsletter_job'

export default class NewsletterController {
  /**
   * S'abonner à la newsletter
   */
  async subscribe({ request, response, session, logger }: HttpContext) {
    const { email } = await request.validateUsing(
      vine.compile(
        vine.object({
          email: vine.string().email().normalizeEmail(),
          website: vine
            .string()
            .optional()
            .transform((value) => {
              // Si le champ website est rempli, c'est probablement un bot
              if (value && value.trim() !== '') {
                throw new Error('Spam détecté')
              }
              return undefined
            }),
        })
      )
    )

    // Vérifier si déjà abonné
    const existing = await NewsletterSubscriber.query().where('email', email).first()

    if (existing && existing.isActive) {
      session.flash('error', 'Vous êtes déjà abonné à la newsletter')
      return response.redirect().back()
    }

    try {
      await db.transaction(async (trx) => {
        // Créer ou mettre à jour l'abonné
        const subscriber = await NewsletterSubscriber.updateOrCreate(
          { email: email },
          {
            email,
            isActive: true,
            confirmedAt: DateTime.now(),
          },
          { client: trx }
        )

        await queue.dispatch(
          NewsletterJob,
          {
            email: email,
            token: subscriber.token,
          },
          {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 10000,
            },
          }
        )
      })

      session.flash('success', 'Inscription réussie ! Vérifiez votre email pour confirmer.')
      return response.redirect().back()
    } catch (e) {
      if (e instanceof mailErrors.E_MAIL_TRANSPORT_ERROR) {
        logger.error('Erreur transport mail:', e)
        session.flash('error', "Erreur lors de l'envoi de l'email. Veuillez réessayer plus tard.")
        return response.redirect().back()
      }

      logger.error("Erreur lors de l'inscription:", e)
      session.flash(
        'error',
        "Erreur lors de l'inscription à la newsletter. Veuillez réessayer plus tard."
      )
      return response.redirect().back()
    }
  }

  /**
   * Se désabonner de la newsletter
   */
  async unsubscribe({ params, request, inertia, logger }: HttpContext) {
    try {
      let subscriber = await NewsletterSubscriber.query()
        .where('token', params.token)
        .where('is_active', true)
        .first()

      // Backward compatibility: chercher avec email si fourni
      if (!subscriber && request.qs().email) {
        subscriber = await NewsletterSubscriber.query()
          .where('token', params.token)
          .where('email', request.qs().email)
          .where('is_active', true)
          .first()
      }

      if (!subscriber) {
        return inertia.render('unsubscribe_status', {
          success: false,
          message: "Vous n'êtes pas abonné ou le lien est invalide",
        })
      }

      // Désactiver l'abonnement
      subscriber.isActive = false
      subscriber.unsubscribedAt = DateTime.now()
      await subscriber.save()

      return inertia.render('unsubscribe_status', {
        success: true,
        message: 'Vous avez été désabonné avec succès de la newsletter',
      })
    } catch (error) {
      logger.error('Erreur lors du désabonnement:', error)
      return inertia.render('unsubscribe_status', {
        success: false,
        message: 'Une erreur est survenue. Veuillez réessayer plus tard.',
      })
    }
  }
}
