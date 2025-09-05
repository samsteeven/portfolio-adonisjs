import vine from '@vinejs/vine'
import { MultipartFile } from '@adonisjs/core/bodyparser'

/**
 * Validates the project's creation action
 */
export const createProjectValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().optional(),
    year: vine
      .string()
      .trim()
      .minLength(4)
      .maxLength(4)
      .regex(/^\d{4}$/),
    role: vine.string().trim().optional(),
    images: vine
      .array(
        vine.file({
          size: '5mb',
          extnames: ['jpg', 'jpeg', 'png', 'webp'],
        })
      )
      .maxLength(4)
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
    year: vine
      .string()
      .trim()
      .minLength(4)
      .maxLength(4)
      .regex(/^\d{4}$/)
      .optional(),
    role: vine.string().trim().optional(),
    images: vine
      .array(
        vine.file({
          size: '5mb',
          extnames: ['jpg', 'jpeg', 'png', 'webp'],
        })
      )
      .maxLength(4)
      .optional(),
    deleteImages: vine.array(vine.number()).optional(),
    demoPath: vine.string().trim().optional(),
    githubPath: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
    technologies: vine.array(vine.number()).optional(),
  })
)

export interface CreateProjectData {
  title: string
  description?: string
  year: string
  role?: string
  demoPath?: string
  githubPath?: string
  isActive?: boolean
  technologies?: number[]
  images?: MultipartFile[] // Paths des images uploadées
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  deleteImages?: number[] // IDs des images à supprimer
}

export interface ProjectFilters {
  search?: string
  technology?: string
  isActive?: boolean
  year?: string
  page?: number
  limit?: number
}
