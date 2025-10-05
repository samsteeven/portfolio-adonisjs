import type { HttpContext } from '@adonisjs/core/http'
import Service from '#models/service'
import {
  createServiceValidator,
  updateServiceValidator,
  reorderServicesValidator,
} from '#validators/service'
import { inject } from '@adonisjs/core'
import FileServiceUpload from '#services/file_upload/file_upload_technolgy_service'
import ServiceAuthorization from '#services/bouncer/bouncer_technology_service'
import FileUploadTechnolyService from '#services/file_upload/file_upload_technolgy_service'

@inject()
export default class ServicesController {
  constructor(private ServiceAuthorizationService: ServiceAuthorization) {}
  /**
   * Afficher la liste des services publics (page des services)
   */
  async publicIndex({ inertia }: HttpContext) {
    const services = await Service.query()
      .apply((scopes) => scopes.active())
      .apply((scopes) => scopes.ordered())
      .exec()

    return inertia.render('services/index', {
      services: services.map((service) =>
        service.serialize({
          fields: ['id', 'title', 'description', 'price', 'publicUrl', 'slug'],
        })
      ),
    })
  }

  /**
   * Afficher un service spécifique (page détail service)
   */
  async publicShow({ params, inertia }: HttpContext) {
    const service = await Service.query()
      .where('slug', params.slug)
      .apply((scopes) => scopes.active())
      .firstOrFail()

    return inertia.render('services/show', {
      service: service.serialize(),
    })
  }

  /**
   * Afficher la liste des services côté admin avec filtres et pagination
   */
  async index({ request, inertia }: HttpContext) {
    const page = request.qs().page || 1

    let query = Service.query().orderBy('displayOrder', 'asc')

    // Pagination
    const services = await query.paginate(page, 12)

    // Statistiques pour le dashboard
    const [total, active, inactive, withPrice, withoutPrice] = await Promise.all([
      Service.query().count('* as total').first(),
      Service.query().where('isActive', true).count('* as total').first(),
      Service.query().where('isActive', false).count('* as total').first(),
      Service.query().whereNotNull('price').count('* as total').first(),
      Service.query().whereNull('price').count('* as total').first(),
    ])

    return inertia.render('admin/services/index', {
      services: services.serialize(),
      stats: {
        total: Number(total?.$extras.total) || 0,
        active: Number(active?.$extras.total) || 0,
        inactive: Number(inactive?.$extras.total) || 0,
        withPrice: Number(withPrice?.$extras.total) || 0,
        withoutPrice: Number(withoutPrice?.$extras.total) || 0,
      },
    })
  }

  /**
   * Afficher le formulaire de création d'un service (admin)
   */
  async create({ inertia }: HttpContext) {
    return inertia.render('admin/services/create')
  }

  /**
   * Créer un nouveau service (admin)
   */
  async store({ request, response, session, bouncer }: HttpContext) {
    const authorize = await bouncer.with('ServicePolicy').allows('store')
    if (!authorize) {
      return this.ServiceAuthorizationService.handleUnauthorized(response, session)
    }
    const data = await request.validateUsing(createServiceValidator)
    try {
      let imagepath: string | undefined
      if (data.image) {
        imagepath = await FileServiceUpload.uploadTechnologyImage(data.image, 'services')
      }
      await Service.create({
        ...data,
        image: imagepath || null,
        displayOrder: data.displayOrder || 1,
      })

      session.flash('success', 'Service créé avec succès')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors de la création du service')
      return response.redirect().back()
    }
  }

  /**
   * Afficher un service spécifique côté admin
   */
  async show({ params, inertia }: HttpContext) {
    const service = await Service.findOrFail(params.id)

    return inertia.render('admin/services/show', {
      service: service.serialize(),
    })
  }

  /**
   * Afficher le formulaire d'édition d'un service (admin)
   */
  async edit({ params, inertia }: HttpContext) {
    const service = await Service.findOrFail(params.id)

    return inertia.render('admin/services/edit', {
      service: service.serialize(),
    })
  }

  /**
   * Mettre à jour un service (admin)
   */
  async update({ params, request, response, session, bouncer }: HttpContext) {
    const authorize = await bouncer.with('ServicePolicy').allows('update')
    if (!authorize) {
      return this.ServiceAuthorizationService.handleUnauthorized(response, session)
    }
    const data = await request.validateUsing(updateServiceValidator)
    const service = await Service.findOrFail(params.id)
    try {
      let imagePath: string | undefined
      if (data.image) {
        imagePath = await FileServiceUpload.replaceTechnologyImage(
          data.image,
          service.image,
          'services'
        )
      }
      service.merge({
        ...data,
        image: imagePath || service.image,
      })
      await service.save()

      session.flash('success', 'Service mis à jour avec succès')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors de la mise à jour du service')
      return response.redirect().back()
    }
  }

  /**
   * Supprimer un service (admin)
   */
  async destroy({ params, response, session, bouncer, logger }: HttpContext) {
    const authorize = await bouncer.with('ServicePolicy').allows('destroy')
    if (!authorize) {
      return this.ServiceAuthorizationService.handleUnauthorized(response, session)
    }
    const service = await Service.findOrFail(params.id)
    try {
      // Vérifier s'il y a des demandes de contact associées
      await service.load('contactRequests')
      if (service.contactRequests && service.contactRequests.length > 0) {
        session.flash(
          'error',
          'Impossible de supprimer ce service car il est associé à des demandes de contact'
        )
        return response.redirect().back()
      }

      if (service.image) {
        try {
          await FileUploadTechnolyService.deleteFile(service.image)
        } catch (error) {
          logger.warn("Erreur lors de la suppression de l'image:", error)
        }
      }

      await service.delete()

      session.flash('success', 'Service supprimé avec succès')
      return response.redirect('/admin/services')
    } catch (error) {
      session.flash('error', 'Erreur lors de la suppression du service')
      return response.redirect().back()
    }
  }

  /**
   * Activer/désactiver un service (admin)
   */
  async toggleStatus({ params, response, session, bouncer }: HttpContext) {
    const authorize = await bouncer.with('ServicePolicy').allows('toggleStatus')
    if (!authorize) {
      return this.ServiceAuthorizationService.handleUnauthorized(response, session)
    }
    const service = await Service.findOrFail(params.id)
    try {
      service.isActive = !service.isActive
      await service.save()

      const status = service.isActive ? 'activé' : 'désactivé'
      session.flash('success', `Service ${status} avec succès`)

      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors du changement de statut')
      return response.redirect().back()
    }
  }

  /**
   * Réorganiser l'ordre d'affichage des services (admin)
   */
  async reorder({ request, response, session, bouncer, logger }: HttpContext) {
    const authorize = await bouncer.with('ServicePolicy').allows('reorder')
    if (!authorize) {
      return this.ServiceAuthorizationService.handleUnauthorized(response, session)
    }

    const data = await request.validateUsing(reorderServicesValidator)
    try {
      // Mettre à jour l'ordre de chaque service
      await Promise.all(
        data.services.map(async (serviceData) => {
          const service = await Service.find(serviceData.id)
          if (service) {
            service.displayOrder = serviceData.displayOrder
            await service.save()
          }
        })
      )

      return response.redirect().back()
    } catch (error) {
      logger.error('Erreur lors de la réorganisation des services:', error)
      return response.redirect().back()
    }
  }

  /**
   * Dupliquer un service (admin)
   */
  async duplicate({ params, response, session, bouncer, logger }: HttpContext) {
    const authorize = await bouncer.with('ServicePolicy').allows('duplicate')
    if (!authorize) {
      return this.ServiceAuthorizationService.handleUnauthorized(response, session)
    }
    const originalService = await Service.findOrFail(params.id)
    try {
      // Créer une copie avec un titre modifié
      const duplicatedService = await Service.create({
        title: `${originalService.title} (Copie)`,
        description: originalService.description,
        image: originalService.image,
        price: originalService.price,
        isActive: false, // Copie désactivée par défaut
        displayOrder: originalService.displayOrder + 1,
      })

      session.flash('success', 'Service dupliqué avec succès')
      return response.redirect(`/admin/services/${duplicatedService.id}/edit`)
    } catch (error) {
      logger.error('Erreur lors de la duplication du service:', error)
      session.flash('error', 'Erreur lors de la duplication du service')
      return response.redirect().back()
    }
  }
}
