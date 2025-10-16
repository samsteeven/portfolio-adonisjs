import { Job } from '@rlanz/bull-queue'
import BlogPost from '#models/blog_post'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import queue from '@rlanz/bull-queue/services/main'
import NotifySubscribersNewPost from '#jobs/notify_suscribers_new_post_job'

interface PublishScheduledPostPayload {
  postId: number
  scheduledFor: string
}

export default class PublishScheduledPost extends Job {
  static get $$filepath() {
    return import.meta.url
  }

  /**
   * Publier un article programmé
   */
  public async handle(payload: PublishScheduledPostPayload) {
    const { postId } = payload

    try {
      const post = await BlogPost.query()
        .where('id', postId)
        .preload('author')
        .preload('tags')
        .firstOrFail()

      // Vérifier que l'article doit encore être publié
      if (!post.publishedAt) {
        logger.warn(`Article ${postId} n'a pas de date de publication programmée`)
        return
      }

      const publishTime = post.publishedAt
      const now = DateTime.now()

      // Vérifier que l'heure de publication est arrivée (avec une marge de 1 minute)
      if (publishTime > now.plus({ minutes: 1 })) {
        logger.warn(`Article ${postId} pas encore prêt pour publication`)
        return
      }

      // Marquer comme publié
      post.published = true
      if (!post.publishedAt) {
        post.publishedAt = DateTime.now()
      }
      await post.save()

      // Envoyer les notifications aux abonnés via un job séparé
      // SEULEMENT si pas déjà notifié
      if (!post.hasBeenNotified) {
        await queue.dispatch(NotifySubscribersNewPost, {
          postId: post.id,
        })
      }

      logger.info(`Article "${post.title}" publié avec succès`)
    } catch (error) {
      logger.error(`Erreur lors de la publication de l'article ${postId}:`, error)
      throw error
    }
  }

  /**
   * Appelé en cas d'échec après toutes les tentatives
   */
  public async rescue(payload: PublishScheduledPostPayload, error: Error) {
    logger.error(
      `Impossible de publier l'article ${payload.postId} après plusieurs tentatives`,
      error
    )

    try {
      const post = await BlogPost.find(payload.postId)
      if (post) {
        logger.error(`Article "${post.title}" n'a pas pu être publié automatiquement`)

        // Notifier l'admin par email
        const { default: AdminNotificationService } = await import(
          '#services/admin_notification_service'
        )
        await AdminNotificationService.notifyArticlePublicationFailure(post.id, post.title, error)
      }
    } catch (rescueError) {
      logger.error('Erreur dans la méthode rescue:', rescueError)
    }
  }
}
