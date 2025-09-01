// Interface pour le modèle Project
import { Technology } from '~/types/technology'

export interface ProjectType {
  id: number
  title: string
  description: string | null
  imgPath: string | null
  imgPathPublicUrl: string | null
  demoPath: string | null
  githubPath: string | null
  isActive: boolean
  technologies: Technology[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ProjectsIndexProps {
  projects: {
    data: ProjectType[]
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
  technologies: Technology[]
  filters: {
    search: string
    technology: string
    isActive: string | null
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

export interface ProjectFormData {
  title: string
  description: string
  image: File | null
  demoPath: string
  githubPath: string
  isActive: boolean
  technologies: number[]
}
