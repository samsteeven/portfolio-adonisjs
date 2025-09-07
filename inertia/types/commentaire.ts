// types/commentaire.ts

import { AuthenticatedUser } from '~/types/index'

export interface CommentaireType {
  id: number
  message: string
  reaction: string | null
  userId: number | null
  createdAt: string
  updatedAt: string | null

  // Relations
  user: AuthenticatedUser

  // Computed properties (depuis le modèle)
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

export interface CreateCommentaireData {
  message: string
  name?: string
  email?: string
}

export interface UpdateReactionData {
  reaction: string | null
}

export interface CommentaireFilters {
  search?: string
  hasReaction?: boolean
  page?: number
  limit?: number
}

export interface ReactionEmojis {
  positive: string[]
  neutral: string[]
  negative: string[]
}

export interface TopReaction {
  emoji: string
  count: number
}
