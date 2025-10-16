import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

interface JobFailureDetails {
  jobName: string
  jobId?: string
  payload: any
  error: Error
  attempts?: number
  failedAt: DateTime
}

export default class AdminNotificationService {
  /**
   * Envoyer une notification à l'admin en cas d'échec de job
   */
  static async notifyJobFailure(details: JobFailureDetails) {
    try {
      const adminEmail = env.get('ADMIN_EMAIL')

      if (!adminEmail) {
        logger.warn("ADMIN_EMAIL non configuré, impossible d'envoyer la notification")
        return
      }

      const emailData = {
        jobName: details.jobName,
        jobId: details.jobId || 'N/A',
        payload: JSON.stringify(details.payload, null, 2),
        errorMessage: details.error.message,
        errorStack: details.error.stack || 'Pas de stack trace',
        attempts: details.attempts || 'N/A',
        failedAt: details.failedAt.toFormat('dd/MM/yyyy HH:mm:ss'),
        appUrl: env.get('APP_URL'),
      }

      await mail.send((message) => {
        message
          .to(adminEmail)
          .from(env.get('MAIL_FROM_ADDRESS'), env.get('MAIL_FROM_NAME'))
          .subject(`🚨 Échec de Job: ${details.jobName}`)
          .htmlView('emails/admin/job_failure', emailData)
      })

      logger.info(`Notification d'échec envoyée à l'admin pour le job ${details.jobName}`)
    } catch (error) {
      // Ne pas faire échouer si l'envoi de notification échoue
      logger.error("Erreur lors de l'envoi de la notification à l'admin:", error)
    }
  }

  /**
   * Notifier l'admin d'un échec de publication d'article
   */
  static async notifyArticlePublicationFailure(postId: number, postTitle: string, error: Error) {
    await this.notifyJobFailure({
      jobName: "Publication d'article",
      payload: { postId, postTitle },
      error,
      failedAt: DateTime.now(),
    })
  }

  /**
   * Notifier l'admin d'un échec d'envoi de newsletter
   */
  static async notifyNewsletterFailure(email: string, error: Error, subscribersCount?: number) {
    await this.notifyJobFailure({
      jobName: 'Envoi Newsletter',
      payload: {
        email,
        subscribersCount: subscribersCount || 'Inconnu',
      },
      error,
      failedAt: DateTime.now(),
    })
  }

  /**
   * Notifier l'admin d'un échec d'envoi d'email de contact
   */
  static async notifyContactEmailFailure(
    contactRequestId: number,
    recipientEmail: string,
    error: Error,
    emailType: 'notification' | 'confirmation' | 'reply'
  ) {
    const jobNames = {
      notification: 'Notification demande de contact',
      confirmation: 'Confirmation demande de contact',
      reply: 'Réponse demande de contact',
    }

    await this.notifyJobFailure({
      jobName: jobNames[emailType],
      payload: {
        contactRequestId,
        recipientEmail,
      },
      error,
      failedAt: DateTime.now(),
    })
  }
}
