import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, computed } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Commentaire extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare message: string

  @column()
  declare reaction: string | null

  // Relation avec l'utilisateur (optionnel pour les visiteurs non connectés)
  @column({ columnName: 'user_id' })
  declare userId: number | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Informations pour les visiteurs non connectés
  @column()
  declare guestName: string | null

  @column()
  declare guestEmail: string | null

  @column()
  declare guestPhone: string | null

  // Informations de localisation
  @column()
  declare ipAddress: string | null

  @column()
  declare country: string | null

  @column()
  declare countryCode: string | null

  @column()
  declare region: string | null

  @column()
  declare regionName: string | null

  @column()
  declare city: string | null

  @column()
  declare zipCode: string | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare timezone: string | null

  @column()
  declare isp: string | null

  @column()
  declare organization: string | null

  // Informations techniques
  @column()
  declare userAgent: string | null

  @column()
  declare referer: string | null

  // Type de commentaire (pour distinguer les visiteurs connectés des invités)
  @column()
  declare commentType: 'authenticated' | 'guest'

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Getter pour obtenir le nom d'affichage
  @computed()
  get displayName(): string {
    if (this.user) {
      return this.user.username
    }
    return this.guestName || 'Visiteur Anonyme'
  }

  // Getter pour obtenir l'email d'affichage
  @computed()
  get displayEmail(): string | null {
    if (this.user) {
      return this.user.email
    }
    return this.guestEmail
  }

  // Getter pour la localisation complète
  get fullLocation(): string | null {
    const parts = []
    if (this.city) parts.push(this.city)
    if (this.regionName) parts.push(this.regionName)
    if (this.country) parts.push(this.country)
    return parts.length > 0 ? parts.join(', ') : null
  }
}
