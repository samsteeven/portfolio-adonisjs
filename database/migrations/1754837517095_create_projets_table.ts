import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
      table.string('title', 191).notNullable().unique()
      table.text('description').nullable()
      table.string('demo_path', 191).nullable().unique()
      table.string('github_path', 191).nullable().unique()
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable().defaultTo(this.now())
      table.index(['is_active', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
