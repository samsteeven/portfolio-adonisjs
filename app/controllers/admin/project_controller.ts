import type { HttpContext } from '@adonisjs/core/http'
import ProjectService from '#services/project_service'
import { createProjectValidator, updateProjectValidator } from '#validators/project'
import { inject } from '@adonisjs/core'

@inject()
export default class ProjectsController {
  constructor(private projectService: ProjectService) {}

  /**
   * Display a list of projects
   */
  async index({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')
    const technology = request.input('technology', '')
    const year = request.input('year', '')
    const isActive = request.input('isActive')

    const projects = await this.projectService.getProjects({
      search,
      technology,
      year,
      isActive: isActive ? Boolean(isActive) : undefined,
      page,
      limit: 12,
    })

    const technologies = await this.projectService.getAllTechnologies()
    const years = await this.projectService.getProjectYears()

    return inertia.render('admin/projects/index', {
      projects: projects.serialize(),
      technologies,
      years,
      filters: {
        search,
        technology,
        year,
        isActive,
      },
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
  async store({ request, response, session, logger }: HttpContext) {
    try {
      // Valider les données
      const payload = await request.validateUsing(createProjectValidator)

      // Extraire les fichiers correctement
      const imagesFiles = request.files('images')

      // Convertir les fichiers en tableau
      const images = Array.isArray(imagesFiles) ? imagesFiles : imagesFiles ? [imagesFiles] : []

      // Filtrer les fichiers valides
      const validImages = images.filter((file) => file && file.isValid)

      await this.projectService.createProject({
        ...payload,
        images: validImages,
      })

      session.flash('success', 'Projet créé avec succès')
      return response.redirect('/admin/projects')
    } catch (error) {
      logger.error('Error creating project:', error)

      // Gestion spécifique des erreurs de validation
      if (error.code === 'E_VALIDATION_ERROR') {
        session.flash('error', 'Données invalides. Vérifiez vos saisies.')
      } else if (error.message?.includes('image')) {
        session.flash('error', 'Erreur lors du traitement des images')
      } else {
        session.flash('error', 'Erreur lors de la création du projet')
      }

      return response.redirect().back()
    }
  }

  /**
   * Display a single project
   */
  async show({ params, inertia, session, response }: HttpContext) {
    try {
      const project = await this.projectService.getProjectById(params.id)

      if (!project) {
        session.flash('error', 'Projet non trouvé')
        return response.redirect('/admin/projects')
      }

      return inertia.render('admin/projects/show', {
        project: project.serialize({
          relations: {
            technologies: {
              fields: ['id', 'name', 'category', 'imgPathPublicUrl', 'lienOrigin'],
            },
            images: {
              fields: ['id', 'imagePath', 'imagePublicUrl', 'order', 'isPrimary', 'createdAt'],
            },
          },
        }),
      })
    } catch (error) {
      console.error('Error showing project:', error)
      session.flash('error', 'Erreur lors de la récupération du projet')
      return response.redirect('/admin/projects')
    }
  }

  /**
   * Show the form for editing a project
   */
  async edit({ params, inertia, session, response }: HttpContext) {
    try {
      const project = await this.projectService.getProjectById(params.id)

      if (!project) {
        session.flash('error', 'Projet non trouvé')
        return response.redirect('/admin/projects')
      }

      const technologies = await this.projectService.getAllTechnologies()

      return inertia.render('admin/projects/edit', {
        project: project.serialize({
          relations: {
            technologies: {
              fields: ['id', 'name', 'category', 'imgPathPublicUrl'],
            },
            images: {
              fields: ['id', 'imagePath', 'imagePublicUrl', 'order', 'isPrimary'],
            },
          },
        }),
        technologies,
      })
    } catch (error) {
      console.error('Error loading edit form:', error)
      session.flash('error', 'Erreur lors du chargement du formulaire')
      return response.redirect('/admin/projects')
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, session, bouncer }: HttpContext) {
    await bouncer.with('ProjectPolicy').authorize('update')

    try {
      // Valider les données
      const payload = await request.validateUsing(updateProjectValidator)

      // Extraire les fichiers
      const imagesFiles = request.files('images', {
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })

      // Convertir en tableau et filtrer
      const images = Array.isArray(imagesFiles) ? imagesFiles : imagesFiles ? [imagesFiles] : []
      const validImages = images.filter((file) => file && file.isValid)

      // Récupérer les IDs des images à supprimer depuis le payload
      const deleteImages = payload.deleteImages || []

      const project = await this.projectService.updateProject(params.id, {
        ...payload,
        images: validImages,
        deleteImages,
      })

      if (!project) {
        session.flash('error', 'Projet non trouvé')
        return response.redirect('/admin/projects')
      }

      // Messages de succès avec détails
      let successMessage = 'Projet mis à jour avec succès'
      if (validImages.length > 0) {
        successMessage += ` (${validImages.length} image(s) ajoutée(s))`
      }
      if (deleteImages.length > 0) {
        successMessage += ` (${deleteImages.length} image(s) supprimée(s))`
      }

      session.flash('success', successMessage)
      return response.redirect().back()
    } catch (error) {
      console.error('Error updating project:', error)

      if (error.code === 'E_VALIDATION_ERROR') {
        session.flash('error', 'Données invalides. Vérifiez vos saisies.')
      } else if (error.message?.includes('image')) {
        session.flash('error', 'Erreur lors du traitement des images')
      } else {
        session.flash('error', 'Erreur lors de la mise à jour du projet')
      }

      return response.redirect().back()
    }
  }

  /**
   * Delete a project
   */
  async destroy({ params, response, session, bouncer }: HttpContext) {
    await bouncer.with('ProjectPolicy').authorize('delete')

    try {
      const deleted = await this.projectService.deleteProject(params.id)

      if (!deleted) {
        session.flash('error', 'Projet non trouvé')
        return response.redirect('/admin/projects')
      }

      session.flash('success', 'Projet et toutes ses images supprimés avec succès')
      return response.redirect('/admin/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      session.flash('error', 'Erreur lors de la suppression du projet')
      return response.redirect().back()
    }
  }

  /**
   * Toggle project active status
   */
  async toggleStatus({ params, response, session, bouncer }: HttpContext) {
    await bouncer.with('ProjectPolicy').authorize('update')

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
      console.error('Error toggling project status:', error)
      session.flash('error', 'Erreur lors du changement de statut')
      return response.redirect().back()
    }
  }

  /**
   * Reorder project images
   */
  async reorderImages({ params, request, response, session, bouncer }: HttpContext) {
    await bouncer.with('ProjectPolicy').authorize('update')

    try {
      const { imageOrders } = request.only(['imageOrders'])

      if (!imageOrders || !Array.isArray(imageOrders)) {
        session.flash('error', 'Données de réorganisation invalides')
        return response.redirect().back()
      }

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
    await bouncer.with('ProjectPolicy').authorize('update')

    try {
      const { imageId } = request.only(['imageId'])

      if (!imageId || Number.isNaN(imageId)) {
        session.flash('error', "ID d'image invalide")
        return response.redirect().back()
      }

      const success = await this.projectService.setPrimaryImage(params.id, Number.parseInt(imageId))

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
