import BlogPost from '#models/blog_post'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import queue from '@rlanz/bull-queue/services/main'
import PublishScheduledPost from '#jobs/blog_publish_job'
import NotifySubscribersNewPost from '#jobs/notify_suscribers_new_post_job'

export default class BlogSchedulerService {
  /**
   * Planifier la publication d'un article
   * Cette méthode est appelée quand on crée/modifie un article avec une date future
   */
  static async schedulePost(post: BlogPost) {
    // Vérifier qu'il y a une date de publication
    if (!post.publishedAt) {
      logger.warn(`Article ${post.id} n'a pas de date de publication`)
      return
    }

    const publishTime = post.publishedAt
    const now = DateTime.now()

    // Si la date de publication est dans le futur, programmer la tâche
    if (publishTime > now) {
      const delay = publishTime.diff(now).milliseconds

      // S'assurer que le délai est positif
      if (delay > 0) {
        await queue.dispatch(
          PublishScheduledPost,
          {
            postId: post.id,
            scheduledFor: publishTime.toISO()!,
          },
          {
            delay: delay,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
          }
        )

        logger.info(
          `Article "${post.title}" programmé pour ${publishTime.toFormat('dd/MM/yyyy HH:mm')}`
        )
      } else {
        logger.warn(`Délai négatif pour l'article ${post.id}, publication immédiate`)
        await this.publishScheduledPost(post.id)
      }
    } else {
      // Si la date est dans le passé, publier immédiatement
      logger.info(`Article ${post.id} programmé dans le passé, publication immédiate`)
      await this.publishScheduledPost(post.id)
    }
  }

  /**
   * Publier un article immédiatement (sans passer par la queue)
   * Utilisé pour publication immédiate ou quand la date programmée est dépassée
   */
  static async publishScheduledPost(postId: number) {
    try {
      const post = await BlogPost.query()
        .where('id', postId)
        .preload('author')
        .preload('tags')
        .firstOrFail()

      // Marquer comme publié
      post.published = true
      if (!post.publishedAt) {
        post.publishedAt = DateTime.now()
      }
      await post.save()

      // Envoyer les notifications aux abonnés
      await this.notifySubscribersOfNewPost(post)

      logger.info(`Article "${post.title}" publié avec succès`)
    } catch (error) {
      logger.error('Erreur lors de la publication programmée:', error)
      throw error
    }
  }

  /**
   * Mettre en queue les notifications pour un nouvel article
   * Cette méthode ne fait QUE dispatcher le job, elle n'envoie pas les emails directement
   */
  static async notifySubscribersOfNewPost(post: BlogPost) {
    try {
      // Dispatcher le job de notification dans la queue
      await queue.dispatch(
        NotifySubscribersNewPost,
        {
          postId: post.id,
        },
        {
          attempts: 5, // Plus de tentatives pour les emails
          backoff: {
            type: 'exponential',
            delay: 10000,
          },
        }
      )

      logger.info(`Notifications mises en queue pour l'article "${post.title}"`)
    } catch (error) {
      logger.error('Erreur lors de la mise en queue des notifications:', error)
      // Ne pas throw l'erreur ici pour ne pas bloquer la publication
      // Les notifications sont secondaires
    }
  }

  /**
   * Vérifier et publier tous les articles programmés
   * À exécuter via un cron job toutes les 5-10 minutes comme backup
   */
  static async checkAndPublishScheduledPosts() {
    try {
      // Récupérer tous les articles avec une date de publication passée
      // qui ne sont PAS encore publiés (published = false)
      const scheduledPosts = await BlogPost.query()
        .where('published', false)
        .whereNotNull('published_at')
        .where('published_at', '<=', DateTime.now().toSQL())
        .whereNull('notified_at')

      logger.info(`${scheduledPosts.length} article(s) à publier`)

      for (const post of scheduledPosts) {
        try {
          await this.publishScheduledPost(post.id)
        } catch (error) {
          logger.error(`Erreur lors de la publication de l'article ${post.id}:`, error)
        }
      }
    } catch (error) {
      logger.error('Erreur lors de la vérification des articles programmés:', error)
    }
  }
}
