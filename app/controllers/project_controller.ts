import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ProjectService } from '#services/project_service'

@inject()
export default class ProjectController {
  constructor(private projectService: ProjectService) {}

  /**
   * Affiche la liste des projets avec pagination et filtres
   */
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const status = request.input('status', 'all')

    const projects = await this.projectService.getProjects({
      page,
      limit,
      search,
      status,
    })

    return inertia.render('admin/projects', { projects })
  }

  /**
   * Affiche le formulaire de création de projet
   */
  async create({ inertia }: HttpContext) {
    const technologies = await this.projectService.getTechnologies()
    return inertia.render('admin/projects/create', { technologies })
  }

  /**
   * Enregistre un nouveau projet
   */
  async store({ request, response, session }: HttpContext) {
    try {
      const projectData = request.only([
        'title',
        'description',
        'imgPath',
        'demoPath',
        'githubPath',
        'isActive',
        'technologies',
      ])

      await this.projectService.createProject(projectData)

      session.flash('success', 'Projet créé avec succès')
      return response.redirect().toRoute('admin.projects')
    } catch (error) {
      session.flash('error', 'Erreur lors de la création du projet')
      return response.redirect().back()
    }
  }

  /**
   * Affiche un projet spécifique
   */
  async show({ inertia, params }: HttpContext) {
    const project = await this.projectService.getProjectById(params.id)
    return inertia.render('admin/projects/show', { project })
  }

  /**
   * Affiche le formulaire d'édition de projet
   */
  async edit({ inertia, params }: HttpContext) {
    const project = await this.projectService.getProjectById(params.id)
    const technologies = await this.projectService.getTechnologies()

    return inertia.render('admin/projects/edit', {
      project,
      technologies,
    })
  }

  /**
   * Met à jour un projet
   */
  async update({ request, response, params, session }: HttpContext) {
    try {
      const projectData = request.only([
        'title',
        'description',
        'imgPath',
        'demoPath',
        'githubPath',
        'isActive',
        'technologies',
      ])

      await this.projectService.updateProject(params.id, projectData)

      session.flash('success', 'Projet mis à jour avec succès')
      return response.redirect().toRoute('admin.projects')
    } catch (error) {
      session.flash('error', 'Erreur lors de la mise à jour du projet')
      return response.redirect().back()
    }
  }

  /**
   * Supprime un projet
   */
  async destroy({ response, params, session }: HttpContext) {
    try {
      await this.projectService.deleteProject(params.id)

      session.flash('success', 'Projet supprimé avec succès')
      return response.redirect().toRoute('admin.projects')
    } catch (error) {
      session.flash('error', 'Erreur lors de la suppression du projet')
      return response.redirect().back()
    }
  }

  /**
   * Change le statut d'un projet
   */
  async toggleStatus({ response, params, session }: HttpContext) {
    try {
      await this.projectService.toggleProjectStatus(params.id)
      session.flash('success', 'Statut du projet mis à jour avec succès')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors de la mise à jour du statut')
      return response.redirect().back()
    }
  }
}
