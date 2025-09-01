import vine from '@vinejs/vine'
import Technology from '#models/technology'

/**
 * Validates the project's creation action
 */
export const createProjectValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().optional(),
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
      .optional(),
    demoPath: vine.string().trim().optional(),
    githubPath: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
    technologies: vine.array(vine.number()).optional(),
  })
)

/**
 * Validates the project's update action
 */
export const updateProjectValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255).optional(),
    description: vine.string().trim().optional(),
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
      .optional(),
    demoPath: vine.string().trim().optional(),
    githubPath: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
    technologies: vine.array(vine.number()).optional(),
  })
)

export interface ProjectData {
  id: number
  title: string
  description: string | null
  imgPath: string | null
  demoPath: string | null
  githubPath: string | null
  isActive: boolean
}

export interface ProjectWithTechnologies extends ProjectData {
  technologies: Technology[]
}

export interface CreateProjectData {
  title: string
  description?: string
  imgPath?: string
  demoPath?: string
  githubPath?: string
  isActive?: boolean
  technologies?: number[]
}

export interface UpdateProjectData {
  title?: string
  description?: string
  imgPath?: string
  demoPath?: string
  githubPath?: string
  isActive?: boolean
  technologies?: number[]
}

export interface ProjectFilters {
  search?: string
  technology?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface ProjectsResponse {
  data: ProjectWithTechnologies[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
    firstPageUrl: string
    lastPageUrl: string
    nextPageUrl: string | null
    previousPageUrl: string | null
  }
}

export interface ProjectFormData {
  title: string
  description: string
  imgPath: string
  demoPath: string
  githubPath: string
  isActive: boolean
  technologies: number[]
}
