export interface ServiceType {
  id: number
  title: string
  slug: string
  description: string
  image: string | null
  price: number | null
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string

  // Getters virtuels
  formattedPrice?: string | null
  publicUrl: string | null
  hasImage?: boolean
}

export interface CreateServiceData {
  title: string
  description: string
  image?: string
  price?: number
  isActive?: boolean
  displayOrder?: number
}

export interface UpdateServiceData {
  title?: string
  description?: string
  image?: string | null
  price?: number | null
  isActive?: boolean
  displayOrder?: number
}

export interface ServiceReorderData {
  services: Array<{
    id: number
    displayOrder: number
  }>
}
