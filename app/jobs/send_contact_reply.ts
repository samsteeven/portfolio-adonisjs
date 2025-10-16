import { Job } from '@rlanz/bull-queue'
import ContactRequest from '#models/contact_request'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

interface SendContactReplyPayload {
  contactRequestId: number
  subject: string
  message: string
  adminNotes?: string
}

export default class SendContactReply extends Job {
  static get $$filepath() {
    return import.meta.url
  }

  /**
   * Envoyer la réponse de l'admin au demandeur
   */
  public async handle(payload: SendContactReplyPayload) {
    const { contactRequestId, subject, message, adminNotes } = payload

    try {
      const contactRequest = await ContactRequest.query()
        .where('id', contactRequestId)
        .preload('service')
        .firstOrFail()

      // Envoyer l'email de réponse
      await mail.send((emailMessage) => {
        emailMessage
          .to(contactRequest.email)
          .from(env.get('MAIL_FROM_ADDRESS'), env.get('MAIL_FROM_NAME'))
          .replyTo(env.get('MAIL_FROM_ADDRESS'))
          .subject(subject)
          .htmlView('emails/contact_reply', {
            contactRequest: contactRequest.serialize(),
            service: contactRequest.service?.serialize() || null,
            replyMessage: message,
            adminName: env.get('ADMIN_NAME') || "L'équipe",
          })
      })

      // Marquer comme répondu et sauvegarder les notes
      await contactRequest.markAsReplied()

      if (adminNotes) {
        contactRequest.adminNotes = adminNotes
        await contactRequest.save()
      }

      logger.info(`Réponse envoyée à ${contactRequest.email} pour la demande #${contactRequestId}`)
    } catch (error) {
      logger.error(
        `Erreur lors de l'envoi de la réponse pour la demande #${contactRequestId}:`,
        error
      )
      throw error
    }
  }

  /**
   * Appelé en cas d'échec après toutes les tentatives
   */
  public async rescue(payload: SendContactReplyPayload, error: Error) {
    logger.error(
      `Impossible d'envoyer la réponse pour la demande #${payload.contactRequestId}`,
      error
    )

    try {
      const contactRequest = await ContactRequest.find(payload.contactRequestId)

      const { default: AdminNotificationService } = await import(
        '#services/admin_notification_service'
      )
      await AdminNotificationService.notifyJobFailure({
        jobName: 'Réponse demande de contact',
        payload: {
          contactRequestId: payload.contactRequestId,
          recipientEmail: contactRequest?.email || 'inconnu',
          subject: payload.subject,
        },
        error,
        failedAt: DateTime.now(),
      })
    } catch (rescueError) {
      logger.error('Erreur dans la méthode rescue:', rescueError)
    }
  }
}
