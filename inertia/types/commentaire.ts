import { AuthenticatedUser } from '~/types/index'

export interface CommentaireType {
  id: number
  message: string
  reaction: string | null
  userId: number | null
  createdAt: string
  updatedAt: string | null

  commentType: 'authenticated' | 'guest'

  // Informations visiteur invité
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null

  // Informations de géolocalisation
  ipAddress: string | null
  country: string | null
  countryCode: string | null
  region: string | null
  regionName: string | null
  city: string | null
  zipCode: string | null
  latitude: number | null
  longitude: number | null
  timezone: string | null
  isp: string | null
  organization: string | null

  // Informations techniques
  userAgent: string | null
  referer: string | null

  // Relations
  user: AuthenticatedUser

  // Computed properties (depuis le modèle)
  fullLocation?: string | null
  isAnonymous?: boolean
  displayName?: string
  displayEmail?: string
  hasReaction?: boolean
  authType?: 'google' | 'github' | 'local'
}

export interface CommentaireStats {
  total: number
  avecReaction: number
  utilisateursConnectes: number
  anonymes: number
  recents: number
  tauxReaction: string
}
