import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, scope, computed } from '@adonisjs/lucid/orm'
import Service from '#models/service'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class ContactRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare message: string

  @column()
  declare serviceId: number | null

  @column()
  declare status: 'pending' | 'read' | 'replied' | 'closed'

  @column()
  declare adminNotes: string | null

  @column.dateTime()
  declare readAt: DateTime | null

  @column.dateTime()
  declare repliedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => Service)
  declare service: BelongsTo<typeof Service>

  // Getters
  @computed()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  get isRead(): boolean {
    return this.readAt !== null
  }

  get isReplied(): boolean {
    return this.repliedAt !== null
  }

  get hasService(): boolean {
    return this.serviceId !== null
  }

  get statusColor(): string {
    switch (this.status) {
      case 'pending':
        return 'yellow'
      case 'read':
        return 'blue'
      case 'replied':
        return 'green'
      case 'closed':
        return 'gray'
      default:
        return 'gray'
    }
  }

  get statusLabel(): string {
    switch (this.status) {
      case 'pending':
        return 'En attente'
      case 'read':
        return 'Lu'
      case 'replied':
        return 'Répondu'
      case 'closed':
        return 'Fermé'
      default:
        return 'Inconnu'
    }
  }

  // Méthodes
  async markAsRead() {
    if (!this.isRead) {
      this.readAt = DateTime.now()
      this.status = 'read'
      await this.save()
    }
  }

  async markAsReplied() {
    if (!this.isReplied) {
      this.repliedAt = DateTime.now()
      this.status = 'replied'
      await this.save()
    }
  }

  async markAsClosed() {
    this.status = 'closed'
    await this.save()
  }

  // Scopes
  static pending = scope((query) => {
    return query.where('status', 'pending')
  })

  static withService = scope((query) => {
    return query.whereNotNull('serviceId')
  })

  static withoutService = scope((query) => {
    return query.whereNull('serviceId')
  })

  static recent = scope((query: any) => {
    return query.orderBy('createdAt', 'desc')
  })
}
