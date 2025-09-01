import Project from '#models/project'
import Technology from '#models/technology'
import type { CreateProjectData, UpdateProjectData, ProjectFilters } from '#validators/project'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import ProjectUploadService from '#services/file_upload_technolgy_service'

export default class ProjectService {
  /**
   * Get all projects with filters and pagination
   */
  async getProjects(filters: ProjectFilters = {}): Promise<ModelPaginatorContract<Project>> {
    const { search, technology, isActive, page = 1, limit = 10 } = filters

    const query = Project.query().preload('technologies')

    // Search filter
    if (search) {
      query.where((subQuery) => {
        subQuery.whereLike('title', `%${search}%`).orWhereLike('description', `%${search}%`)
      })
    }

    // Technology filter
    if (technology) {
      query.whereHas('technologies', (techQuery) => {
        techQuery.where('name', technology)
      })
    }

    // Active status filter
    if (typeof isActive === 'boolean') {
      query.where('isActive', isActive)
    }

    // Order by most recent
    query.orderBy('createdAt', 'desc')

    return await query.paginate(page, limit)
  }

  /**
   * Get a single project by ID
   */
  async getProjectById(id: number): Promise<Project | null> {
    return await Project.query().where('id', id).preload('technologies').first()
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectData & { image?: MultipartFile }): Promise<Project> {
    const { technologies, image, ...projectData } = data

    let imgPath: string | undefined

    // Handle image upload
    if (image) {
      imgPath = await ProjectUploadService.uploadTechnologyImage(image, 'projects')
    }

    // Create project
    const project = await Project.create({
      ...projectData,
      imgPath,
      isActive: data.isActive ?? true,
    })

    // Attach technologies if provided
    if (technologies && technologies.length > 0) {
      await project.related('technologies').attach(technologies)
    }

    // Load technologies for response
    await project.load('technologies')

    return project
  }

  /**
   * Update an existing project
   */
  async updateProject(
    id: number,
    data: UpdateProjectData & { image?: MultipartFile }
  ): Promise<Project | null> {
    const project = await Project.find(id)
    if (!project) return null

    const { technologies, image, ...projectData } = data

    let imgPath: string | undefined

    // Gérer le remplacement d'image si nécessaire
    if (image?.isValid) {
      const oldImagePath = project.imgPath
      imgPath = await ProjectUploadService.replaceTechnologyImage(image, oldImagePath, 'projects')
    }

    // Update project data
    project.merge({
      ...projectData,
      ...(imgPath && { imgPath }),
    })
    await project.save()

    // Update technologies if provided
    if (technologies !== undefined) {
      await project.related('technologies').sync(technologies)
    }

    // Load technologies for response
    await project.load('technologies')

    return project
  }

  /**
   * Delete a project
   */
  async deleteProject(id: number): Promise<boolean> {
    const project = await Project.find(id)
    if (!project) return false

    // Delete associated image
    if (project.imgPath) {
      await ProjectUploadService.deleteFile(project.imgPath)
    }

    // Detach all technologies
    await project.related('technologies').detach()

    // Delete project
    await project.delete()

    return true
  }

  /**
   * Toggle project active status
   */
  async toggleProjectStatus(id: number): Promise<Project | null> {
    const project = await Project.find(id)
    if (!project) return null

    project.isActive = !project.isActive
    await project.save()

    await project.load('technologies')
    return project
  }

  /**
   * Get all technologies for project creation/editing
   */
  async getAllTechnologies(): Promise<Technology[]> {
    return Technology.query().orderBy('name', 'asc')
  }

  /**
   * Get projects by technology
   */
  async getProjectsByTechnology(technologyId: number): Promise<Project[]> {
    return Project.query()
      .whereHas('technologies', (techQuery) => {
        techQuery.where('technologies.id', technologyId)
      })
      .preload('technologies')
      .where('isActive', true)
      .orderBy('createdAt', 'desc')
  }

  /**
   * Get recent projects
   */
  async getRecentProjects(limit: number = 5): Promise<Project[]> {
    return Project.query()
      .preload('technologies')
      .where('isActive', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
  }

  /**
   * Search projects
   */
  async searchProjects(searchTerm: string, limit: number = 10): Promise<Project[]> {
    return Project.query()
      .preload('technologies')
      .where((query) => {
        query.whereLike('title', `%${searchTerm}%`).orWhereLike('description', `%${searchTerm}%`)
      })
      .where('isActive', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
  }
}
