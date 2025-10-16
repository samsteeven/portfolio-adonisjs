import { Job } from '@rlanz/bull-queue'
import BlogPost from '#models/blog_post'
import logger from '@adonisjs/core/services/logger'
import NewsletterSubscriber from '#models/newsletter_suscriber'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'

interface NotifySubscribersNewPostPayload {
  postId: number
}

export default class NotifySubscribersNewPost extends Job {
  static get $$filepath() {
    return import.meta.url
  }

  /**
   * Notifier tous les abonnés d'un nouvel article
   */
  public async handle(payload: NotifySubscribersNewPostPayload) {
    const { postId } = payload

    try {
      const post = await BlogPost.query()
        .where('id', postId)
        .preload('author')
        .preload('tags')
        .firstOrFail()

      logger.info(`Début de l'envoi des notifications pour l'article "${post.title}"`)

      const subscribers = await NewsletterSubscriber.query().where('isActive', true)

      for (const subscriber of subscribers) {
        await mail.send((message) => {
          message
            .to(subscriber.email)
            .from(env.get('MAIL_FROM_ADDRESS'), env.get('MAIL_FROM_NAME'))
            .subject(`Nouvel article: ${post.title}`)
            .htmlView('emails/new_blog_post', { post, subscriber })
        })
      }
      // Marquer comme notifié
      await post.markAsNotified()
      logger.info(`Notifications traitées avec succès pour l'article "${post.title}"`)
    } catch (error) {
      logger.error(`Erreur lors de l'envoi des notifications pour l'article ${postId}:`, error)
      throw error
    }
  }

  /**
   * Appelé en cas d'échec après toutes les tentatives
   */
  public async rescue(payload: NotifySubscribersNewPostPayload, error: Error) {
    logger.error(`Impossible d'envoyer les notifications pour l'article ${payload.postId}`, error)
  }
}
