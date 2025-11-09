import { UserRole } from '~/enums/user_role'

export type Variant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'light'
  | 'dark'
  | 'link'
  | 'no-color'

export interface Project {
  title: string
  year: number
  description: string
  role: string
  techStack: string[]
  thumbnail: string
  longThumbnail: string
  images: string[]
  slug: string
  liveUrl?: string
  sourceCode?: string
}

export interface InertiaProps {
  errors?: Record<string, string>
  portfolioOwner?: AuthenticatedUser
  auth?: {
    user: AuthenticatedUser
    usersCount: number
    commentsCount: number | null
    subscribersCount: number | null
  }
  error?: string
  success?: string
  warn?: string
  newsletterSuccess?: boolean
  [key: string]: any
}

// Type pour l'utilisateur authentifié
export interface AuthenticatedUser {
  id: number
  username: string
  email: string
  role: UserRole
  isActive: boolean
  provider: string
  subInfo?: {
    profilGithub?: string
    profilLinkedin?: string
    profilTwitter?: string
    profilMail?: string
    profilDiscord?: string
    photoPath?: string
    photoPathPublicUrl?: string
    phone?: string
    bio?: string
    bio2?: string
    cv?: string
    cvPublicUrl: string | null
  }
  createdAt: Date | string
  updatedAt: Date | string
}
