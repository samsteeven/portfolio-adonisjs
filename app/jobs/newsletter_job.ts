import { Job } from '@rlanz/bull-queue'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import NewsletterSubscriber from '#models/newsletter_suscriber'

interface NewsletterJobPayload {
  email: string
  token: string
}

export default class NewsletterJob extends Job {
  static get $$filepath() {
    return import.meta.url
  }

  /**
   * Envoyer la notification de confirmation d'abonnement a ma newsletter
   */
  async handle(payload: NewsletterJobPayload) {
    const { email, token } = payload

    try {
      logger.info("Envoi du mail de confirmation d'abonnement a la newsletter")

      // Envoyer l'email de confirmation
      await mail.send((message) => {
        message
          .to(email)
          .from(env.get('MAIL_FROM_ADDRESS'), env.get('MAIL_FROM_NAME'))
          .subject("Confirmation d'inscription à la newsletter")
          .htmlView('emails/newsletter_confirmation', {
            email,
            token: token,
            unsubscribeUrl: `${env.get('APP_URL')}/newsletter/unsubscribe/${token}?email=${email}`,
          })
      })

      logger.info(`Notifications envoyées avec succès pour le user "${email}"`)
    } catch (error) {
      logger.error(`Erreur lors de l'envoi du mail pour le user ${email}:`, error)
      throw error // Permet à BullMQ de réessayer
    }
  }

  /**
   * Appelé en cas d'échec après toutes les tentatives
   */
  async rescue(payload: NewsletterJobPayload, error: Error) {
    logger.error(
      `Échec définitif de l'envoi de la notification de confirmation a la nwslette pour : ${payload.email}`,
      error
    )

    try {
      const subscribersCount = await NewsletterSubscriber.query()
        .where('is_active', true)
        .whereNotNull('confirmed_at')
        .count('* as total')

      // Notifier l'admin par email
      const { default: AdminNotificationService } = await import(
        '#services/admin_notification_service'
      )
      await AdminNotificationService.notifyNewsletterFailure(
        payload.email,
        error,
        subscribersCount[0]?.$extras?.total || 0
      )
    } catch (rescueError) {
      logger.error('Erreur dans la méthode rescue du NewsletterJob:', rescueError)
    }
  }
}
