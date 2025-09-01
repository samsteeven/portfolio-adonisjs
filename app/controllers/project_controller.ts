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
    const isActive = request.input('isActive')

    const projects = await this.projectService.getProjects({
      search,
      technology,
      isActive: isActive ? Boolean(isActive) : undefined,
      page,
      limit: 12,
    })

    const technologies = await this.projectService.getAllTechnologies()

    return inertia.render('admin/projects/index', {
      projects: projects.serialize(),
      technologies,
      filters: {
        search,
        technology,
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
  async store({ request, response, session }: HttpContext) {
    try {
      const payload = await request.validateUsing(createProjectValidator)

      await this.projectService.createProject(payload)

      session.flash('success', 'Projet créé avec succès')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors de la création du projet')
      return response.redirect().back()
    }
  }

  /**
   * Display a single project
   */
  async show({ params, inertia, session, response }: HttpContext) {
    const project = await this.projectService.getProjectById(params.id)

    if (!project) {
      session.flash('error', 'Projet non trouvé')
      return response.redirect().back()
    }

    return inertia.render('admin/projects/show', {
      project: project.serialize({
        relations: {
          technologies: {
            fields: ['id', 'name', 'category', 'imgPathPublicUrl', 'lienOrigin'],
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

    if (!project) {
      return
    }

    const technologies = await this.projectService.getAllTechnologies()

    return inertia.render('admin/projects/edit', {
      project: project.serialize({
        relations: {
          technologies: {
            fields: ['id', 'name', 'category', 'imgPathPublicUrl'],
          },
        },
      }),
      technologies,
    })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, session, bouncer }: HttpContext) {
    await bouncer.with('ProjectPolicy').authorize('update')

    try {
      const payload = await request.validateUsing(updateProjectValidator)

      const project = await this.projectService.updateProject(params.id, payload)

      if (!project) {
        session.flash('error', 'Projet non trouvé')
        return response.redirect().back()
      }

      session.flash('success', 'Projet mis à jour avec succès')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors de la mise à jour du projet')
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
        return response.redirect().back()
      }

      session.flash('success', 'Projet supprimé avec succès')
      return response.redirect().back()
    } catch (error) {
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
      session.flash('error', 'Erreur lors du changement de statut')
      return response.redirect().back()
    }
  }

  /**
   * Get projects by technology (API endpoint)
   */
  async getByTechnology({ params, response }: HttpContext) {
    try {
      const projects = await this.projectService.getProjectsByTechnology(params.technologyId)

      return response.json({
        success: true,
        data: projects.map((project) =>
          project.serialize({
            relations: {
              technologies: {
                fields: ['id', 'name', 'category'],
              },
            },
          })
        ),
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des projets',
      })
    }
  }
}
