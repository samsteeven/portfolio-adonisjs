import { Job } from '@rlanz/bull-queue'
import ContactRequest from '#models/contact_request'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

interface SendContactRequestNotificationPayload {
  contactRequestId: number
}

export default class SendContactRequestNotification extends Job {
  static get $$filepath() {
    return import.meta.url
  }

  /**
   * Envoyer un email de notification à l'admin pour une nouvelle demande de contact
   */
  public async handle(payload: SendContactRequestNotificationPayload) {
    const { contactRequestId } = payload

    try {
      const contactRequest = await ContactRequest.query()
        .where('id', contactRequestId)
        .preload('service')
        .firstOrFail()

      await mail.send((message) => {
        message
          .to(env.get('ADMIN_EMAIL') || env.get('MAIL_FROM_ADDRESS'))
          .from(env.get('MAIL_FROM_ADDRESS'), env.get('MAIL_FROM_NAME'))
          .replyTo(contactRequest.email, contactRequest.firstName)
          .subject(
            `🔔 Nouvelle demande de contact${contactRequest.service ? ` - ${contactRequest.service.title}` : ''}`
          )
          .htmlView('emails/admin/new_contact_request', {
            contactRequest: contactRequest.serialize(),
            service: contactRequest.service?.serialize() || null,
            adminUrl: `${env.get('APP_URL')}/admin/contact-requests/${contactRequest.id}`,
          })
      })

      logger.info(
        `Notification admin envoyée pour la demande de contact #${contactRequestId} de ${contactRequest.email}`
      )
    } catch (error) {
      logger.error(
        `Erreur lors de l'envoi de la notification admin pour la demande #${contactRequestId}:`,
        error
      )
      throw error
    }
  }

  /**
   * Appelé en cas d'échec après toutes les tentatives
   */
  public async rescue(payload: SendContactRequestNotificationPayload, error: Error) {
    logger.error(
      `Impossible d'envoyer la notification admin pour la demande #${payload.contactRequestId}`,
      error
    )

    try {
      const contactRequest = await ContactRequest.find(payload.contactRequestId)

      const { default: AdminNotificationService } = await import(
        '#services/admin_notification_service'
      )
      await AdminNotificationService.notifyJobFailure({
        jobName: 'Notification demande de contact',
        payload: {
          contactRequestId: payload.contactRequestId,
          email: contactRequest?.email || 'inconnu',
        },
        error,
        failedAt: DateTime.now(),
      })
    } catch (rescueError) {
      logger.error('Erreur dans la méthode rescue:', rescueError)
    }
  }
}
