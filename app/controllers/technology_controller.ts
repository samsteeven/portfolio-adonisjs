import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { TechnologyService } from '#services/technology_service'
import TechnologyAuthorizationService from '#services/bouncer_technology_service'
import FileUploadTechnolyService from '#services/file_upload_technolgy_service'
import {
  createTechnologySchema,
  updateTechnologySchema,
  technologyFiltersSchema,
} from '#validators/technologie'

@inject()
export default class TechnologyController {
  constructor(
    private technologyService: TechnologyService,
    private technologyServiceAuthorization: TechnologyAuthorizationService
  ) {}

  /**
   * Affiche la liste des technologies avec pagination et filtres
   */
  async index({ inertia, request, response, session }: HttpContext) {
    // Validation des filtres
    const filters = await request.validateUsing(technologyFiltersSchema)

    try {
      const paginator = await this.technologyService.getTechnologies(filters)
      const technologies = paginator.serialize()
      const categories = await this.technologyService.getCategories()

      return inertia.render('admin/technologies/index', {
        technologies,
        categories,
        filters,
      })
    } catch (error) {
      session.flash('error', 'Erreur lors du chargement des technologies')
      return response.redirect().back()
    }
  }

  /**
   * Affiche le formulaire de création d'une technologie
   */
  async create({ inertia, session, response }: HttpContext) {
    try {
      const categories = await this.technologyService.getCategories()
      return inertia.render('admin/technologies/create', { categories })
    } catch (error) {
      session.flash('error', 'Erreur lors du chargement du formulaire')
      return response.redirect().toPath('/admin/technologies')
    }
  }

  /**
   * Enregistre une nouvelle technologie
   */
  async store({ request, response, session, bouncer }: HttpContext) {
    // Vérification d'autorisation
    const authResult = await this.technologyServiceAuthorization.canCreateTechnology(bouncer)
    if (!authResult.authorized) {
      return this.technologyServiceAuthorization.handleUnauthorized(
        response,
        session,
        authResult.error
      )
    }

    const data = await request.validateUsing(createTechnologySchema)
    let imgPath: string | undefined

    // Gestion de l'upload d'image
    if (data.imgPath?.isValid) {
      try {
        imgPath = await FileUploadTechnolyService.uploadTechnologyImage(
          data.imgPath,
          'technologies'
        )
      } catch (error) {
        session.flash('error', error.message)
        return response.redirect().back()
      }
    }

    try {
      await this.technologyService.createTechnology({ ...data, imgPath: imgPath || null })

      session.flash('success', 'Technologie créée avec succès')
      return response.redirect().back()
    } catch (error) {
      // Nettoyer l'image en cas d'erreur
      if (imgPath) {
        await FileUploadTechnolyService.deleteFile(imgPath)
      }

      session.flash('error', error.message || 'Erreur lors de la création de la technologie')
      return response.redirect().back()
    }
  }

  /**
   * Affiche une technologie spécifique
   */
  async show({ inertia, params, response, session }: HttpContext) {
    try {
      // Charger les projets associés
      const technology = await this.technologyService.getTechnologyById(params.id, true)

      if (!technology) {
        session.flash('error', 'Technologie introuvable')
        return response.redirect().back()
      }
      return inertia.render('admin/technologies/show', { technology })
    } catch (error) {
      session.flash('error', 'Erreur lors du chargement de la technologie')
      return response.redirect().back()
    }
  }

  /**
   * Affiche le formulaire d'édition d'une technologie
   */
  async edit({ inertia, params, response, session }: HttpContext) {
    const technology = await this.technologyService.getTechnologyById(params.id)

    if (!technology) {
      session.flash('error', 'Technologie introuvable')
      return response.redirect().back()
    }
    try {
      const categories = await this.technologyService.getCategories()
      return inertia.render('admin/technologies/edit', { technology, categories })
    } catch (error) {
      session.flash('error', 'Erreur lors du chargement du formulaire')
      return response.redirect().back()
    }
  }

  /**
   * Met à jour une technologie
   */
  async update({ request, response, params, session, bouncer }: HttpContext) {
    // Vérification d'autorisation
    const authResult = await this.technologyServiceAuthorization.canUpdateTechnology(bouncer)
    if (!authResult.authorized) {
      return this.technologyServiceAuthorization.handleUnauthorized(
        response,
        session,
        authResult.error
      )
    }

    const technology = await this.technologyService.getTechnologyById(params.id)
    if (!technology) {
      session.flash('error', 'Technologie introuvable')
      return response.redirect().back()
    }
    const data = await request.validateUsing(updateTechnologySchema, { meta: { id: params.id } })

    try {
      let imgPath: string | undefined

      // Gérer le remplacement d'image si nécessaire
      if (data.imgPath?.isValid) {
        const oldImagePath = technology.imgPath
        imgPath = await FileUploadTechnolyService.replaceTechnologyImage(
          data.imgPath,
          oldImagePath,
          'technologies'
        )
      }

      // Mettre à jour la technologie
      try {
        await this.technologyService.updateTechnology(technology, {
          ...data,
          imgPath: imgPath || technology.imgPath,
        })
      } catch (e) {
        session.flash('error', e.message)
        return response.redirect().back()
      }

      session.flash('success', 'Technologie mise à jour avec succès')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message || 'Erreur lors de la mise à jour de la technologie')
      return response.redirect().back()
    }
  }

  /**
   * Supprime une technologie
   */
  async destroy({ response, params, session, bouncer, logger }: HttpContext) {
    // Vérification d'autorisation
    const authResult = await this.technologyServiceAuthorization.canDeleteTechnology(bouncer)
    if (!authResult.authorized) {
      return this.technologyServiceAuthorization.handleUnauthorized(
        response,
        session,
        authResult.error
      )
    }

    const technology = await this.technologyService.getTechnologyById(params.id)

    if (!technology) {
      session.flash('error', 'Technologie introuvable')
      return response.redirect().back()
    }
    try {
      // Supprimer l'image associée si elle existe
      if (technology.imgPath) {
        try {
          await FileUploadTechnolyService.deleteFile(technology.imgPath)
        } catch (error) {
          // Log l'erreur mais ne pas bloquer la suppression
          logger.warn("Erreur lors de la suppression de l'image:", error)
        }
      }

      await technology.delete()

      session.flash('success', 'Technologie supprimée avec succès')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message || 'Erreur lors de la suppression de la technologie')
      return response.redirect().back()
    }
  }
}
