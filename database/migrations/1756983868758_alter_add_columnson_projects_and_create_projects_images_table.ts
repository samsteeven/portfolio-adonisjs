import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Ajouter la colonne année
      table.string('year', 4).notNullable().defaultTo('2023')

      // Ajouter la colonne rôle (HTML)
      table.text('role').nullable()
    })

    // Créer la table pour les images multiples
    this.schema.createTable('project_images', (table) => {
      table.increments('id')
      table
        .bigInteger('project_id')
        .unsigned()
        .references('id')
        .inTable('projects')
        .onDelete('CASCADE')
      table.string('image_path').notNullable()
      table.integer('order').defaultTo(0) // Pour l'ordre des images
      table.boolean('is_primary').defaultTo(false) // Image principale
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable('project_images')

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('year')
      table.dropColumn('role')
    })
  }
}
