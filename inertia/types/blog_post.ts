interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string | null
  photoPathPublicUrl: string | null
  publishedAt: string
  published: boolean
  createdAt: string
  updatedAt: string
  notifiedAt: string | null
  author: {
    id: number
    username: string
  }
  tags: Array<{
    id: number
    name: string
    slug: string
    color?: string
  }>
}

interface Tag {
  id: number
  name: string
  slug: string
}
