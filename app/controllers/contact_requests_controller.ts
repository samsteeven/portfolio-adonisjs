import type { HttpContext } from '@adonisjs/core/http'
import ContactRequest from '#models/contact_request'
import Service from '#models/service'
import {
  createContactRequestValidator,
  updateContactRequestStatusValidator,
  contactRequestFilterValidator,
  replyToContactRequestValidator,
} from '#validators/contact_request'
import { inject } from '@adonisjs/core'
import ContactRequestAuthorization from '#services/bouncer/bouncer_technology_service'
import { UserRole } from '#enums/user_role'
import queue from '@rlanz/bull-queue/services/main'
import SendContactRequestNotification from '#jobs/send_contact_request_notification'
import SendContactConfirmation from '#jobs/send_contact_confirmation'
import SendContactReply from '#jobs/send_contact_reply'

@inject()
export default class ContactRequestsController {
  constructor(private ContactRequestAuthorizationService: ContactRequestAuthorization) {}

  /**
   * Afficher le formulaire de contact public
   */
  async showForm({ inertia, request }: HttpContext) {
    let selectedService = null
    let slug = request.qs().selectedService

    if (slug) {
      selectedService = await Service.query()
        .where('slug', slug)
        .apply((scopes) => scopes.active())
        .first()
    }

    const services = await Service.query()
      .apply((scopes) => scopes.active())
      .apply((scopes) => scopes.ordered())
      .select('id', 'title', 'slug', 'description', 'price')
      .exec()

    return inertia.render('contact', {
      selectedService: selectedService?.serialize() || null,
      services: services.map((service) => service.serialize()),
    })
  }

  /**
   * Créer une nouvelle demande de contact
   */
  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(createContactRequestValidator)

    try {
      // Vérifier que le service existe s'il est spécifié
      if (data.serviceId) {
        const service = await Service.find(data.serviceId)
        if (!service || !service.isActive) {
          session.flash('error', 'Service sélectionné introuvable ou inactif')
          return response.redirect().back()
        }
      }

      // Créer la demande de contact
      const contactRequest = await ContactRequest.create({
        ...data,
        serviceId: data.serviceId || null,
      })

      // Dispatcher les jobs d'envoi d'emails en arrière-plan
      // Priorité haute pour la notification admin
      await queue.dispatch(
        SendContactRequestNotification,
        { contactRequestId: contactRequest.id },
        {
          priority: 1, // Haute priorité
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 10000, // 10s, 40s, 90s...
          },
        }
      )

      // Priorité normale pour la confirmation client
      await queue.dispatch(
        SendContactConfirmation,
        { contactRequestId: contactRequest.id },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        }
      )

      session.flash(
        'success',
        'Votre demande a été envoyée avec succès ! Nous vous recontacterons rapidement.'
      )
      return response.redirect('/contact')
    } catch (error) {
      if (error.message === 'Spam détecté') {
        // Ne pas révéler la détection de spam au bot
        return response.redirect('/contact')
      }

      session.flash('error', "Erreur lors de l'envoi de votre demande")
      return response.redirect().back()
    }
  }

  /**
   * Afficher les demandes de contact côté admin avec filtres et pagination
   */
  async index({ request, inertia, auth }: HttpContext) {
    const user = auth.user
    const isAdmin = user && user.role === UserRole.ADMIN

    if (!isAdmin) {
      return inertia.render('admin/contact-requests/index', {
        isRestricted: true,
      })
    }

    const filters = await request.validateUsing(contactRequestFilterValidator)
    const { page = 1, limit = 15 } = filters

    let query = ContactRequest.query().preload('service').orderBy('createdAt', 'desc')

    // Pagination
    const contactRequests = await query.paginate(page, limit)

    // Statistiques pour le dashboard
    const [total, pending, read, replied, closed, withService, withoutService] = await Promise.all([
      ContactRequest.query().count('* as total').first(),
      ContactRequest.query().where('status', 'pending').count('* as total').first(),
      ContactRequest.query().where('status', 'read').count('* as total').first(),
      ContactRequest.query().where('status', 'replied').count('* as total').first(),
      ContactRequest.query().where('status', 'closed').count('* as total').first(),
      ContactRequest.query().whereNotNull('serviceId').count('* as total').first(),
      ContactRequest.query().whereNull('serviceId').count('* as total').first(),
    ])

    const services = await Service.query()
      .apply((scopes) => scopes.active())
      .apply((scopes) => scopes.ordered())
      .select('id', 'title')
      .exec()

    return inertia.render('admin/contact-requests/index', {
      contactRequests: contactRequests.serialize(),
      services: services.map((service) => service.serialize()),
      filters,
      stats: {
        total: total?.$extras.total || 0,
        pending: pending?.$extras.total || 0,
        read: read?.$extras.total || 0,
        replied: replied?.$extras.total || 0,
        closed: closed?.$extras.total || 0,
        withService: withService?.$extras.total || 0,
        withoutService: withoutService?.$extras.total || 0,
      },
    })
  }

  /**
   * Afficher une demande de contact spécifique côté admin
   */
  async show({ params, inertia, response, bouncer, session }: HttpContext) {
    const authorize = await bouncer.with('ContactRequestPolicy').allows('show')
    if (!authorize) {
      return this.ContactRequestAuthorizationService.handleUnauthorized(response, session)
    }

    const contactRequest = await ContactRequest.query()
      .where('id', params.id)
      .preload('service')
      .firstOrFail()

    // Marquer comme lu si ce n'est pas déjà fait
    await contactRequest.markAsRead()

    return inertia.render('admin/contact-requests/show', {
      contactRequest: contactRequest.serialize(),
    })
  }

  /**
   * Mettre à jour le statut d'une demande de contact (admin)
   */
  async updateStatus({ params, request, response, session, bouncer }: HttpContext) {
    const authorize = await bouncer.with('ContactRequestPolicy').allows('updateStatus')
    if (!authorize) {
      return this.ContactRequestAuthorizationService.handleUnauthorized(response, session)
    }

    const contactRequest = await ContactRequest.findOrFail(params.id)
    const data = await request.validateUsing(updateContactRequestStatusValidator)

    try {
      contactRequest.status = data.status
      if (data.adminNotes) {
        contactRequest.adminNotes = data.adminNotes
      }

      // Mettre à jour les timestamps selon le statut
      switch (data.status) {
        case 'read':
          await contactRequest.markAsRead()
          break
        case 'replied':
          await contactRequest.markAsReplied()
          break
        case 'closed':
          await contactRequest.markAsClosed()
          break
      }

      await contactRequest.save()

      session.flash('success', 'Statut mis à jour avec succès')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors de la mise à jour du statut')
      return response.redirect().back()
    }
  }

  /**
   * Répondre à une demande de contact par email (admin)
   */
  async reply({ params, request, response, session, bouncer }: HttpContext) {
    const authorize = await bouncer.with('ContactRequestPolicy').allows('reply')
    if (!authorize) {
      return this.ContactRequestAuthorizationService.handleUnauthorized(response, session)
    }

    const data = await request.validateUsing(replyToContactRequestValidator)
    const contactRequest = await ContactRequest.findOrFail(params.id)

    try {
      // Dispatcher le job d'envoi de réponse
      await queue.dispatch(
        SendContactReply,
        {
          contactRequestId: contactRequest.id,
          subject: data.subject,
          message: data.message,
          adminNotes: data.adminNotes,
        },
        {
          priority: 1, // Haute priorité pour les réponses
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 10000,
          },
        }
      )

      session.flash('success', "Réponse mise en file d'envoi avec succès")
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors de la mise en queue de la réponse')
      console.error(error)
      return response.redirect().back()
    }
  }

  /**
   * Supprimer une demande de contact (admin)
   */
  async destroy({ params, response, session, bouncer }: HttpContext) {
    const authorize = await bouncer.with('ContactRequestPolicy').allows('destroy')
    if (!authorize) {
      return this.ContactRequestAuthorizationService.handleUnauthorized(response, session)
    }

    const contactRequest = await ContactRequest.findOrFail(params.id)

    try {
      await contactRequest.delete()

      session.flash('success', 'Demande de contact supprimée avec succès')
      return response.redirect('/admin/contact-requests')
    } catch (error) {
      session.flash('error', 'Erreur lors de la suppression')
      return response.redirect().back()
    }
  }

  /**
   * Marquer plusieurs demandes comme lues (admin)
   */
  async bulkMarkAsRead({ request, response, session, bouncer }: HttpContext) {
    const authorize = await bouncer.with('ContactRequestPolicy').allows('bulkUpdate')
    if (!authorize) {
      return this.ContactRequestAuthorizationService.handleUnauthorized(response, session)
    }

    try {
      const { ids } = request.only(['ids'])

      if (!Array.isArray(ids) || ids.length === 0) {
        session.flash('error', 'Aucune demande sélectionnée')
        return response.redirect().back()
      }

      await ContactRequest.query().whereIn('id', ids).where('status', 'pending').update({
        status: 'read',
        readAt: new Date(),
      })

      session.flash('success', `${ids.length} demande(s) marquée(s) comme lues`)
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors de la mise à jour')
      return response.redirect().back()
    }
  }
}
