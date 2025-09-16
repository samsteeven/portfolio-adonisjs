// database/migrations/xxxx_xx_xx_xxxxxx_newsletter_subscribers.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class NewsletterSubscribers extends BaseSchema {
  protected tableName = 'newsletter_subscribers'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('email').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.string('token', 64).notNullable()
      table.timestamp('subscribed_at', { useTz: true }).notNullable()
      table.timestamp('confirmed_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
