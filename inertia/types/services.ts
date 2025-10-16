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
