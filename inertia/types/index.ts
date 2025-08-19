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

// Types pour les props d'Inertia
export interface InertiaProps {
  errors?: ValidationErrors
  auth: {
    user?: AuthenticatedUser
  }
  [key: string]: any
}

// Type pour les erreurs de validation
export interface ValidationErrors {
  [key: string]: string
}

// Type pour l'utilisateur authentifié
export interface AuthenticatedUser {
  id?: number
  username: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date | string
  updatedAt?: Date | string
}
