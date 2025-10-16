export type SkillType = {
  id: number
  name: string
  category: string
  description: string | null
  imagePath: string | null
  imagePathPublicUrl: string | null
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

// Pour la pagination
export type Paginated<T> = {
  data: T[]
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

// Pour les filtres
export type SkillFilters = {
  search?: string
  category?: string
  page?: number
  limit?: number
}

// Pour la page index
export type SkillIndexProps = {
  skills: Paginated<SkillType>
  categories: string[]
  filters: SkillFilters
}
