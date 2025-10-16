import type { HttpContext } from '@adonisjs/core/http'
import ProjectService from '#services/project_service'
import {
  createProjectValidator,
  updateProjectValidator,
  reorderImagesValidator,
  setPrimaryImageValidator,
} from '#validators/project'
import { inject } from '@adonisjs/core'
import ProjectBouncerService from '#services/bouncer/bouncer_technology_service'

@inject()
export default class ProjectsController {
  constructor(
    private projectService: ProjectService,
    private projectBouncerService: ProjectBouncerService
  ) {}

  /**
   * Display a list of projects
   */
  async index({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)

    const projects = await this.projectService.getProjects({
      page,
      limit: 10,
    })

    const technologies = await this.projectService.getAllTechnologies()
    const years = await this.projectService.getProjectYears()

    return inertia.render('admin/projects/index', {
      projects: projects.serialize(),
      technologies,
      years,
    })
  }

  /**
   * Show the form for creating a new project
   */
  async create({ inertia }: HttpContext) {
    const technologies = await this.projectService.getAllTechnologies()

    return inertia.render('admin/projects/create', {
      technologies,
    })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, session, logger, bouncer }: HttpContext) {
    const authorize = await bouncer.with('ProjectPolicy').allows('create')
    if (!authorize) {
      return this.projectBouncerService.handleUnauthorized(response, session)
    }
    const payload = await request.validateUsing(createProjectValidator)
    try {
      await this.projectService.createProject({
        ...payload,
        images: payload.images,
      })

      session.flash('success', 'Projet créé avec succès')
      return response.redirect('/admin/projects')
    } catch (error) {
      logger.error('Error creating project:', error)
      session.flash('error', 'Erreur lors de la création du projet')
      return response.redirect().back()
    }
  }

  /**
   * Display a single project
   */
  async show({ params, inertia }: HttpContext) {
    const project = await this.projectService.getProjectById(params.id)

    return inertia.render('admin/projects/show', {
      project: project.serialize({
        relations: {
          technologies: {
            fields: { pick: ['id', 'name', 'category', 'imgPathPublicUrl', 'lienOrigin'] },
          },
          images: {
            fields: {
              pick: ['id', 'imagePath', 'imagePublicUrl', 'order', 'isPrimary', 'createdAt'],
            },
          },
        },
      }),
    })
  }

  /**
   * Show the form for editing a project
   */
  async edit({ params, inertia }: HttpContext) {
    const project = await this.projectService.getProjectById(params.id)
    const technologies = await this.projectService.getAllTechnologies()

    return inertia.render('admin/projects/edit', {
      project: project.serialize({
        relations: {
          technologies: {
            fields: { pick: ['id', 'name', 'category', 'imgPathPublicUrl'] },
          },
          images: {
            fields: { pick: ['id', 'imagePath', 'imagePublicUrl', 'order', 'isPrimary'] },
          },
        },
      }),
      technologies,
    })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, session, bouncer, logger }: HttpContext) {
    const authorize = await bouncer.with('ProjectPolicy').allows('update')
    if (!authorize) {
      return this.projectBouncerService.handleUnauthorized(response, session)
    }

    const payload = await request.validateUsing(updateProjectValidator)
    try {
      // Récupérer les IDs des images à supprimer depuis le payload
      const deleteImages = payload.deleteImages || []
      const images = payload.images
      const project = await this.projectService.updateProject(params.id, {
        ...payload,
        images: images,
        deleteImages,
      })

      if (!project) {
        session.flash('error', 'Projet non trouvé')
        return response.redirect('/admin/projects')
      }

      // Messages de succès avec détails
      let successMessage = 'Projet mis à jour avec succès'
      if (images && images.length > 0) {
        successMessage += ` (${images.length} image(s) ajoutée(s))`
      }
      if (deleteImages.length > 0) {
        successMessage += ` (${deleteImages.length} image(s) supprimée(s))`
      }

      session.flash('success', successMessage)
      return response.redirect().back()
    } catch (error) {
      logger.error('Error updating project:', error)
      session.flash('error', 'Erreur lors de la mise à jour du projet')

      return response.redirect().back()
    }
  }

  /**
   * Delete a project
   */
  async destroy({ params, response, session, bouncer, logger }: HttpContext) {
    const authorize = await bouncer.with('ProjectPolicy').allows('delete')
    if (!authorize) {
      return this.projectBouncerService.handleUnauthorized(response, session)
    }

    try {
      const deleted = await this.projectService.deleteProject(params.id)

      if (!deleted) {
        session.flash('error', 'Projet non trouvé')
        return response.redirect('/admin/projects')
      }

      session.flash('success', 'Projet et toutes ses images supprimés avec succès')
      return response.redirect('/admin/projects')
    } catch (error) {
      logger.error('Error deleting project : ', error)
      session.flash('error', 'Erreur lors de la suppression du projet')
      return response.redirect().back()
    }
  }

  /**
   * Toggle project active status
   */
  async toggleStatus({ params, response, session, bouncer, logger }: HttpContext) {
    const authorize = await bouncer.with('ProjectPolicy').allows('update')
    if (!authorize) {
      return this.projectBouncerService.handleUnauthorized(response, session)
    }

    try {
      const project = await this.projectService.toggleProjectStatus(params.id)

      if (!project) {
        session.flash('error', 'Projet non trouvé')
        return response.redirect().back()
      }

      const status = project.isActive ? 'activé' : 'désactivé'
      session.flash('success', `Projet ${status} avec succès`)

      return response.redirect().back()
    } catch (error) {
      logger.error('Error toggling project status:', error)
      session.flash('error', 'Erreur lors du changement de statut')
      return response.redirect().back()
    }
  }

  /**
   * Reorder project images
   */
  async reorderImages({ params, request, response, session, bouncer }: HttpContext) {
    const authorize = await bouncer.with('ProjectPolicy').allows('update')
    if (!authorize) {
      return this.projectBouncerService.handleUnauthorized(response, session)
    }

    const { imageOrders } = await request.validateUsing(reorderImagesValidator)
    try {
      const success = await this.projectService.reorderImages(params.id, imageOrders)

      if (!success) {
        session.flash('error', 'Erreur lors de la réorganisation des images')
        return response.redirect().back()
      }

      session.flash('success', 'Images réorganisées avec succès')
      return response.redirect().back()
    } catch (error) {
      console.error('Error reordering images:', error)
      session.flash('error', 'Erreur lors de la réorganisation des images')
      return response.redirect().back()
    }
  }

  /**
   * Set primary image for a project
   */
  async setPrimaryImage({ params, request, response, session, bouncer }: HttpContext) {
    const authorize = await bouncer.with('ProjectPolicy').allows('update')
    if (!authorize) {
      return this.projectBouncerService.handleUnauthorized(response, session)
    }

    const { imageId } = await request.validateUsing(setPrimaryImageValidator)
    try {
      const success = await this.projectService.setPrimaryImage(params.id, imageId)

      if (!success) {
        session.flash('error', "Erreur lors de la définition de l'image principale")
        return response.redirect().back()
      }

      session.flash('success', 'Image principale définie avec succès')
      return response.redirect().back()
    } catch (error) {
      console.error('Error setting primary image:', error)
      session.flash('error', "Erreur lors de la définition de l'image principale")
      return response.redirect().back()
    }
  }
}
