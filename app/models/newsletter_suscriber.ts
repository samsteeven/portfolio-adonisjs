import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import string from '@adonisjs/core/helpers/string'

export default class NewsletterSubscriber extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column({
    consume: (value) => Boolean(value),
  })
  declare isActive: boolean

  @column()
  declare token: string // pour désabonnement

  @column.dateTime({ autoCreate: true })
  declare subscribedAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare confirmedAt: DateTime | null

  @beforeCreate()
  static assignToken(subscriber: NewsletterSubscriber) {
    subscriber.token = string.generateRandom(32)
  }
}
