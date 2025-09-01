import { ProjectType } from '~/types/projets'

export interface Technology {
  id: number
  name: string
  category: string
  imgPath: string
  imgPathPublicUrl: string
  lienOrigin: string | null
  description: string | null
  projects: ProjectType[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface TechnologyFilters {
  search?: string
  category?: string
  page?: number
  limit?: number
}
