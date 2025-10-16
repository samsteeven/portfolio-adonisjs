import { ServiceType } from '~/types/services'

export interface ContactRequestType {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  message: string
  serviceId: number | null
  status: 'pending' | 'read' | 'replied' | 'closed'
  adminNotes: string | null
  readAt: string | null
  repliedAt: string | null
  createdAt: string
  updatedAt: string

  // Relations
  service?: ServiceType | null

  // Getters virtuels
  fullName: string
  isRead?: boolean
  isReplied?: boolean
  hasService?: boolean
  statusColor?: string
  statusLabel?: string
}

export interface CreateContactRequestData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  message: string
  serviceId?: number
  website?: string // Honeypot field
}
