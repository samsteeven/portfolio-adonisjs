import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'commentaires'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // 1. Supprimer d'abord la contrainte de clé étrangère existante
      table.dropForeign(['user_id'])

      // 2. Supprimer les colonnes name et email
      table.dropColumn('name')
      table.dropColumn('email')

      // // 3. Modifier user_id pour le rendre obligatoire (maintenant que la contrainte FK est supprimée)
      table.integer('user_id').unsigned().notNullable().alter()

      // 4. Recréer la contrainte de clé étrangère avec CASCADE
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE') // Supprimer les commentaires si l'utilisateur est supprimé
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // 1. Supprimer la contrainte de clé étrangère CASCADE
      table.dropForeign(['user_id'])
    })

    // 2. Remettre user_id en nullable
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('user_id').unsigned().nullable().alter()
    })

    // 3. Restaurer les colonnes supprimées et la contrainte FK originale
    this.schema.alterTable(this.tableName, (table) => {
      table.string('name').notNullable()
      table.string('email', 191).notNullable()

      // Restaurer la contrainte de clé étrangère originale
      table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL')
    })
  }
}
