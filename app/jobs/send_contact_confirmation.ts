// app/jobs/send_contact_confirmation.ts
import { Job } from '@rlanz/bull-queue'
import ContactRequest from '#models/contact_request'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

interface SendContactConfirmationPayload {
  contactRequestId: number
}

export default class SendContactConfirmation extends Job {
  static get $$filepath() {
    return import.meta.url
  }

  /**
   * Envoyer un email de confirmation au demandeur
   */
  public async handle(payload: SendContactConfirmationPayload) {
    const { contactRequestId } = payload

    try {
      const contactRequest = await ContactRequest.query()
        .where('id', contactRequestId)
        .preload('service')
        .firstOrFail()

      await mail.send((message) => {
        message
          .to(contactRequest.email)
          .from(env.get('MAIL_FROM_ADDRESS'), env.get('MAIL_FROM_NAME'))
          .subject('✓ Confirmation de votre demande de contact')
          .htmlView('emails/contact_confirmation', {
            contactRequest: contactRequest.serialize(),
            service: contactRequest.service?.serialize() || null,
            supportEmail: env.get('MAIL_FROM_ADDRESS'),
          })
      })

      logger.info(
        `Email de confirmation envoyé à ${contactRequest.email} pour la demande #${contactRequestId}`
      )
    } catch (error) {
      logger.error(
        `Erreur lors de l'envoi de la confirmation pour la demande #${contactRequestId}:`,
        error
      )
      throw error
    }
  }

  /**
   * Appelé en cas d'échec après toutes les tentatives
   */
  public async rescue(payload: SendContactConfirmationPayload, error: Error) {
    logger.error(
      `Impossible d'envoyer la confirmation pour la demande #${payload.contactRequestId}`,
      error
    )

    // La confirmation client est moins critique, on log juste l'erreur
    // Pas besoin de notifier l'admin
  }
}
