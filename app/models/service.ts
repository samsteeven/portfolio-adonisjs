import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, hasMany, scope, computed } from '@adonisjs/lucid/orm'
import ContactRequest from '#models/contact_request'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Service extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare description: string

  @column()
  declare image: string | null

  @column()
  declare price: number | null

  @column()
  declare isActive: boolean

  @column()
  declare displayOrder: number

  @hasMany(() => ContactRequest)
  declare contactRequests: HasMany<typeof ContactRequest>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Hooks
  @beforeCreate()
  static async beforeCreate(service: Service) {
    if (!service.slug) {
      service.slug = service.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    if (!service.displayOrder) {
      const lastService = await Service.query().orderBy('displayOrder', 'desc').first()

      service.displayOrder = lastService ? lastService.displayOrder + 1 : 1
    }
  }

  @computed()
  get publicUrl() {
    if (!this.image) return null
    return `/admin/uploads/${this.image}`
  }

  // Scopes
  static active = scope((query) => {
    return query.where('isActive', true)
  })

  static ordered = scope((query) => {
    return query.orderBy('displayOrder', 'asc')
  })

  // Getters
  get formattedPrice(): string | null {
    return this.price ? `${this.price.toLocaleString('fr-FR')} €` : null
  }

  get hasImage(): boolean {
    return this.image !== null && this.image !== ''
  }
}
