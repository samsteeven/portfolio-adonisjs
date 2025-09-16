import type { HttpContext } from '@adonisjs/core/http'
import NewsletterSubscriber from '#models/newsletter_suscriber'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import NewsletterAuthorizationService from '#services/bouncer/bouncer_technology_service'

@inject()
export default class NewsletterController {
  public constructor(private newsletterAuthorization: NewsletterAuthorizationService) {}
  async index({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')
    const status = request.input('status', '')

    let query = NewsletterSubscriber.query().orderBy('subscribedAt', 'desc')

    // Filtres côté serveur si nécessaire
    if (search) {
      query = query.where('email', 'like', `%${search}%`)
    }

    if (status === 'active') {
      query = query.where('isActive', true).whereNotNull('confirmedAt')
    } else if (status === 'inactive') {
      query = query.where('isActive', false)
    } else if (status === 'unconfirmed') {
      query = query.where('isActive', true).whereNull('confirmedAt')
    }

    const subscribers = await query.paginate(page, 20)

    // Statistiques
    const stats = {
      totalSubscribers: await NewsletterSubscriber.query().count('* as total').first(),
      activeSubscribers: await NewsletterSubscriber.query()
        .where('isActive', true)
        .whereNotNull('confirmedAt')
        .count('* as total')
        .first(),
      recentSubscribers: await NewsletterSubscriber.query()
        .where('subscribedAt', '>=', DateTime.now().minus({ month: 1 }).toSQL())
        .count('* as total')
        .first(),
      unsubscribeRate: 0, // Calculer selon votre logique
    }

    return inertia.render('admin/newsletter/index', {
      subscribers: subscribers.serialize(),
      stats: {
        totalSubscribers: stats.totalSubscribers?.$extras.total || 0,
        activeSubscribers: stats.activeSubscribers?.$extras.total || 0,
        recentSubscribers: stats.recentSubscribers?.$extras.total || 0,
        unsubscribeRate: stats.unsubscribeRate,
      },
      filters: { search, status },
    })
  }

  async destroy({ params, response, session, bouncer }: HttpContext) {
    const autorize = await bouncer.with('NewsletterPolicy').allows('delete')
    if (!autorize) {
      return this.newsletterAuthorization.handleUnauthorized(response, session)
    }
    const subscriber = await NewsletterSubscriber.findOrFail(params.id)
    await subscriber.delete()

    session.flash('success', 'Abonné supprimé avec succès')
    return response.redirect('/admin/newsletter')
  }

  async bulkDestroy({ request, response, session, bouncer }: HttpContext) {
    const autorize = await bouncer.with('NewsletterPolicy').allows('delete')
    if (!autorize) {
      return this.newsletterAuthorization.handleUnauthorized(response, session)
    }
    const { ids } = request.only(['ids'])

    await NewsletterSubscriber.query().whereIn('id', ids).delete()

    session.flash('success', `${ids.length} abonné(s) supprimé(s) avec succès`)
    return response.redirect('/admin/newsletter')
  }

  async toggleStatus({ params, request, response, bouncer, session }: HttpContext) {
    const autorize = await bouncer.with('NewsletterPolicy').allows('toggleStatus')
    if (!autorize) {
      return this.newsletterAuthorization.handleUnauthorized(response, session)
    }
    const subscriber = await NewsletterSubscriber.findOrFail(params.id)
    const { isActive } = request.only(['isActive'])

    subscriber.isActive = isActive
    await subscriber.save()

    return response.redirect().back()
  }
}
