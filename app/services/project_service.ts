import { inject } from '@adonisjs/core'
import Project from '#models/project'
import Technology from '#models/technology'
import { Exception } from '@adonisjs/core/exceptions'

@inject()
export class ProjectService {
  /**
   * Récupère la liste des projets avec pagination et filtres
   */
  async getProjects({
    page,
    limit,
    search,
    status,
  }: {
    page: number
    limit: number
    search: string
    status: string
  }) {
    const query = Project.query().preload('technologies')

    // Filtre par recherche
    if (search) {
      query.where((subQuery: any) => {
        subQuery.where('title', 'like', `%${search}%`).orWhere('description', 'like', `%${search}%`)
      })
    }

    // Filtre par statut
    if (status && status !== 'all') {
      query.where('is_active', status === 'active')
    }

    // Pagination
    return await query.orderBy('created_at', 'desc').paginate(page, limit)
  }

  /**
   * Récupère un projet par son ID
   */
  async getProjectById(id: string | number) {
    return await Project.query().where('id', id).preload('technologies').firstOrFail()
  }

  /**
   * Récupère toutes les technologies
   */
  async getTechnologies() {
    return Technology.query().orderBy('name', 'asc')
  }

  /**
   * Crée un nouveau projet
   */
  async createProject(data: {
    title: string
    description: string
    imgPath: string
    demoPath: string
    githubPath: string
    isActive: boolean
    technologies: number[]
  }) {
    // Vérifier si le titre existe déjà
    const existingProject = await Project.findBy('title', data.title)
    if (existingProject) {
      throw new Exception('Un projet avec ce titre existe déjà', {
        status: 400,
        code: 'TITLE_ALREADY_EXISTS',
      })
    }

    // Créer le projet
    const project = await Project.create({
      title: data.title,
      description: data.description,
      imgPath: data.imgPath,
      demoPath: data.demoPath,
      githubPath: data.githubPath,
      isActive: data.isActive,
    })

    // Attacher les technologies
    if (data.technologies.length > 0) {
      await project.related('technologies').attach(data.technologies)
    }

    return project
  }

  /**
   * Met à jour un projet
   */
  async updateProject(
    id: string | number,
    data: {
      title?: string
      description?: string
      imgPath?: string
      demoPath?: string
      githubPath?: string
      isActive?: boolean
      technologies?: number[]
    }
  ) {
    const project = await Project.findOrFail(id)

    // Vérifier si le titre existe déjà (sauf pour le projet actuel)
    if (data.title && data.title !== project.title) {
      const existingProject = await Project.findBy('title', data.title)
      if (existingProject) {
        throw new Exception('Un projet avec ce titre existe déjà', {
          status: 400,
          code: 'TITLE_ALREADY_EXISTS',
        })
      }
    }

    // Mettre à jour le projet
    project.merge({
      title: data.title,
      description: data.description,
      imgPath: data.imgPath,
      demoPath: data.demoPath,
      githubPath: data.githubPath,
      isActive: data.isActive,
    })
    await project.save()

    // Synchroniser les technologies
    if (data.technologies) {
      await project.related('technologies').sync(data.technologies)
    }

    return project
  }

  /**
   * Supprime un projet
   */
  async deleteProject(id: string | number) {
    const project = await Project.findOrFail(id)

    // Détacher les technologies
    await project.related('technologies').detach()

    await project.delete()
    return true
  }

  /**
   * Active/désactive un projet
   */
  async toggleProjectStatus(id: string | number) {
    const project = await Project.findOrFail(id)
    project.isActive = !project.isActive
    await project.save()
    return project
  }

  /**
   * Récupère les statistiques des projets
   */
  async getProjectStats() {
    const total = await Project.query().count('* as total').first()
    const active = await Project.query().where('is_active', true).count('* as count').first()
    const inactive = await Project.query().where('is_active', false).count('* as count').first()

    return {
      total: total?.$extras.total || 0,
      active: active?.$extras.count || 0,
      inactive: inactive?.$extras.count || 0,
    }
  }
}
