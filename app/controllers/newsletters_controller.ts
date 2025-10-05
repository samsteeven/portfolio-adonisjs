import NewsletterSubscriber from '#models/newsletter_suscriber'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import vine from '@vinejs/vine'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import { errors as mailErrors } from '@adonisjs/mail'
import db from '@adonisjs/lucid/services/db'
export default class NewsletterController {
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

    const existing = await NewsletterSubscriber.query().where('email', email).first()

    if (existing && existing.isActive) {
      session.flash('error', 'Vous êtes déjà abonné à la newsletter')
      return response.redirect().back()
    }

    try {
      await db.transaction(async (trx) => {
        const newsletter = await NewsletterSubscriber.updateOrCreate(
          { email: email },
          {
            email,
            isActive: true,
            confirmedAt: DateTime.now(), // ou null si double opt-in
          },
          { client: trx }
        )
        await mail.send((message) => {
          message
            .to(email)
            .from(env.get('MAIL_FROM_ADDRESS'), env.get('MAIL_FROM_NAME'))
            .subject("Confirmation d'inscription à la newsletter")
            .htmlView('emails/newsletter_confirmation', {
              email,
              token: newsletter.token,
            })
        })
      })

      session.flash('success', 'Inscription réussie à la newsletter !')
      return response.redirect().back()
    } catch (e) {
      if (e instanceof mailErrors.E_MAIL_TRANSPORT_ERROR) {
        session.flash('error', "Erreur lors de l'envoi de l'email. Veuillez réessayer plus tard.")
        return response.redirect().back()
      }
      session.flash(
        'error',
        "Erreur lors de l'inscription à la newsletter. Veuillez réessayer plus tard."
      )
      logger.error(e)
      return response.redirect().back()
    }
  }

  async unsubscribe({ params, request, inertia }: HttpContext) {
    let subscriber = await NewsletterSubscriber.query()
      .where('token', params.token)
      .where('isActive', true)
      .first()

    // If subscriber not found with just token, check with email as well (for backward compatibility)
    if (!subscriber && request.qs().email) {
      subscriber = await NewsletterSubscriber.query()
        .where('token', params.token)
        .where('email', request.qs().email)
        .where('isActive', true)
        .first()
    }

    if (!subscriber) {
      return inertia.render('unsubscribe_status', { isSubscribed: false })
    }

    subscriber.isActive = false
    subscriber.token = ''
    await subscriber.save()

    return inertia.render('unsubscribe_status', { isSubscribed: true })
  }
}
