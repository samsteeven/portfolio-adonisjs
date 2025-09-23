import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'services'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('title').notNullable()
      table.string('slug').unique().notNullable()
      table.text('description').notNullable()
      table.string('image').nullable()
      table.decimal('price', 10, 2).nullable()
      table.boolean('is_active').defaultTo(true)
      table.integer('display_order').defaultTo(1)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Index pour améliorer les performances
      table.index(['is_active', 'display_order'])
      table.index('slug')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
