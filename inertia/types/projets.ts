// Interface pour le modèle Project
import { Technology } from '~/types/technology'

export interface ProjectType {
  id: number
  title: string
  slug: string
  description: string | null
  year: string
  role: string | null
  demoPath: string | null
  githubPath: string | null
  isActive: boolean
  technologies: Technology[]
  images: ProjectImage[]
  createdAt: Date | string
  updatedAt: Date | string
}

interface ProjectImage {
  id: number
  imagePath: string
  imagePublicUrl: string
  order: number
  isPrimary: boolean
}

export interface ProjectsIndexProps {
  projects: {
    data: ProjectType[]
    meta?: {
      total: number
      page: number
      perPage: number
    }
  }
  technologies: Technology[]
  years?: string[]
  filters?: {
    search: string
    technology: string
    year: string
    isActive: string
  }
}

export interface ProjectCreateProps {
  technologies: Array<Technology>
}

export interface ProjectEditProps {
  project: ProjectType
  technologies: Technology[]
}

export interface ProjectShowProps {
  project: ProjectType
}
