import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateBlogPosts extends BaseSchema {
  protected tableName = 'blog_posts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.string('slug').unique().notNullable()
      table.text('excerpt').nullable()
      table.text('content').notNullable()
      table.string('featured_image').nullable()
      table.boolean('published').defaultTo(false)
      table.timestamp('published_at', { useTz: true }).nullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
