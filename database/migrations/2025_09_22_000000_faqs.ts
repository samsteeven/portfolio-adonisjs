import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Faqs extends BaseSchema {
  protected tableName = 'faqs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('question').notNullable()
      table.text('answer').notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
