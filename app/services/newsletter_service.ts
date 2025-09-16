import NewsletterSubscriber from '#models/newsletter_suscriber'
import BlogPost from '#models/blog_post'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'

export default class NewsletterService {
  static async sendWelcomeEmail(subscriber: NewsletterSubscriber) {
    await mail.send((message) => {
      message
        .to(subscriber.email)
        .subject('Bienvenue dans ma newsletter !')
        .htmlView('emails/welcome', {
          unsubscribeUrl: `${env.get('APP_URL')}/newsletter/unsubscribe/${subscriber.token}`,
        })
    })
  }

  static async sendNewPostNotification(post: BlogPost) {
    const subscribers = await NewsletterSubscriber.query()
      .where('isActive', true)
      .whereNotNull('confirmedAt')

    await post.load('tags')

    for (const subscriber of subscribers) {
      await mail.send((message) => {
        message
          .to(subscriber.email)
          .subject(`Nouvel article : ${post.title}`)
          .htmlView('emails/new_post', {
            post: post.serialize({
              relations: {
                tags: {
                  fields: ['name'],
                },
              },
            }),
            unsubscribeUrl: `${env.get('APP_URL')}/newsletter/unsubscribe/${subscriber.token}`,
          })
      })
    }
  }
}
