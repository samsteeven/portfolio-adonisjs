import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

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
  declare token: string

  @column.dateTime({ autoCreate: true })
  declare subscribedAt: DateTime

  @column.dateTime()
  declare unsubscribedAt: DateTime | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare confirmedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  @beforeCreate()
  static assignToken(subscriber: NewsletterSubscriber) {
    subscriber.token = crypto.randomBytes(32).toString('hex')
  }
}
