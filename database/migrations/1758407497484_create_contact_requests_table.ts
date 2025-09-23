import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contact_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('email').notNullable()
      table.string('phone').nullable()
      table.text('message').notNullable()

      // Relation optionnelle vers les services
      table.integer('service_id').unsigned().nullable()
      table.foreign('service_id').references('id').inTable('services').onDelete('SET NULL')

      // Gestion du statut et suivi
      table.enum('status', ['pending', 'read', 'replied', 'closed']).defaultTo('pending')
      table.text('admin_notes').nullable()

      // Timestamps de suivi
      table.timestamp('read_at').nullable()
      table.timestamp('replied_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Index pour améliorer les performances
      table.index(['status', 'created_at'])
      table.index('service_id')
      table.index('email')
      table.index('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
