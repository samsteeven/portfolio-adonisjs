import Project from '#models/project'
import ProjectImage from '#models/project_image'
import Technology from '#models/technology'
import type { CreateProjectData, UpdateProjectData, ProjectFilters } from '#validators/project'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import ProjectUploadService from '#services/file_upload/file_upload_technolgy_service'

export default class ProjectService {
  /**
   * Get all projects with filters and pagination
   */
  async getProjects(filters: ProjectFilters = {}): Promise<ModelPaginatorContract<Project>> {
    const { search, technology, isActive, year, page = 1, limit = 10 } = filters

    const query = Project.query()
      .preload('technologies')
      .preload('images', (imageQuery) => {
        imageQuery.orderBy('order', 'asc')
      })

    // Search filter
    if (search) {
      query.where((subQuery) => {
        subQuery
          .whereLike('title', `%${search}%`)
          .orWhereLike('description', `%${search}%`)
          .orWhereLike('role', `%${search}%`)
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

    // Year filter
    if (year) {
      query.where('year', year)
    }

    // Order by most recent
    query.orderBy('createdAt', 'desc')

    return await query.paginate(page, limit)
  }

  /**
   * Get a single project by ID
   */
  async getProjectById(id: number): Promise<Project | null> {
    return await Project.query()
      .where('id', id)
      .preload('technologies')
      .preload('images', (imageQuery) => {
        imageQuery.orderBy('order', 'asc')
      })
      .first()
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    const { technologies, images, ...projectData } = data

    // Create project
    const project = await Project.create({
      ...projectData,
      isActive: data.isActive ?? true,
    })

    // Handle multiple images upload
    if (images && images.length > 0) {
      const imagePromises = images.map(async (imageFile, index) => {
        if (imageFile.isValid) {
          const imagePath = await ProjectUploadService.uploadTechnologyImage(imageFile, 'projects')
          return ProjectImage.create({
            projectId: project.id,
            imagePath,
            order: index,
            isPrimary: index === 0, // First image is primary
          })
        }
        return null
      })

      await Promise.all(imagePromises.filter(Boolean))
    }

    // Attach technologies if provided
    if (technologies && technologies.length > 0) {
      await project.related('technologies').attach(technologies)
    }

    // Load relations for response
    await project.load('technologies')
    await project.load('images')

    return project
  }

  /**
   * Update an existing project
   */
  async updateProject(id: number, data: UpdateProjectData): Promise<Project | null> {
    const project = await Project.find(id)
    if (!project) return null

    const { technologies, images, deleteImages, ...projectData } = data

    // Update project data
    project.merge({
      ...projectData,
    })
    await project.save()

    // Delete specified images
    if (deleteImages && deleteImages.length > 0) {
      const imagesToDelete = await ProjectImage.query()
        .whereIn('id', deleteImages)
        .where('projectId', project.id)

      for (const imageToDelete of imagesToDelete) {
        await ProjectUploadService.deleteFile(imageToDelete.imagePath)
        await imageToDelete.delete()
      }
    }

    // Add new images
    if (images && images.length > 0) {
      // Get current max order
      const maxOrder = await ProjectImage.query()
        .where('projectId', project.id)
        .max('order as maxOrder')
        .first()

      const startOrder = (maxOrder?.$extras.maxOrder ?? -1) + 1

      const imagePromises = images.map(async (imageFile, index) => {
        if (imageFile.isValid) {
          const imagePath = await ProjectUploadService.uploadTechnologyImage(imageFile, 'projects')
          return ProjectImage.create({
            projectId: project.id,
            imagePath,
            order: startOrder + index,
            isPrimary: false, // Les nouvelles images ne sont pas principales par défaut
          })
        }
        return null
      })

      await Promise.all(imagePromises.filter(Boolean))
    }

    // Update technologies if provided
    if (technologies !== undefined) {
      await project.related('technologies').sync(technologies)
    }

    // Load relations for response
    await project.load('technologies')
    await project.load('images')

    return project
  }

  /**
   * Delete a project
   */
  async deleteProject(id: number): Promise<boolean> {
    const project = await Project.query().where('id', id).preload('images').first()

    if (!project) return false

    // Delete all associated images
    for (const image of project.images) {
      await ProjectUploadService.deleteFile(image.imagePath)
      await image.delete()
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
    await project.load('images')
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
      .preload('images')
      .where('isActive', true)
      .orderBy('createdAt', 'desc')
  }

  /**
   * Get recent projects
   */
  async getRecentProjects(limit: number = 5): Promise<Project[]> {
    return Project.query()
      .preload('technologies')
      .preload('images')
      .where('isActive', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
  }
  /**
   * Get projects by year
   */
  async getProjectsByYear(year: string): Promise<Project[]> {
    return Project.query()
      .preload('technologies')
      .preload('images')
      .where('year', year)
      .where('isActive', true)
      .orderBy('createdAt', 'desc')
  }

  /**
   * Get distinct years from projects
   */
  async getProjectYears(): Promise<string[]> {
    const result = await Project.query()
      .distinct('year')
      .where('isActive', true)
      .orderBy('year', 'desc')

    return result.map((r) => r.year)
  }

  /**
   * Reorder project images
   */
  async reorderImages(
    projectId: number,
    imageOrders: { id: number; order: number }[]
  ): Promise<boolean> {
    try {
      for (const { id, order } of imageOrders) {
        await ProjectImage.query().where('id', id).where('projectId', projectId).update({ order })
      }
      return true
    } catch {
      return false
    }
  }

  /**
   * Set primary image
   */
  async setPrimaryImage(projectId: number, imageId: number): Promise<boolean> {
    try {
      // Reset all images to not primary
      await ProjectImage.query().where('projectId', projectId).update({ isPrimary: false })

      // Set selected image as primary
      await ProjectImage.query()
        .where('id', imageId)
        .where('projectId', projectId)
        .update({ isPrimary: true })

      return true
    } catch {
      return false
    }
  }
}
