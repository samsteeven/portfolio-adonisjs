import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'commentaires'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Ajouter la colonne reaction
      table.renameColumn('emoji', 'reaction')

      // Ajouter updated_at si pas déjà présent
      table.timestamp('updated_at').nullable()

      // Index pour les performances sur les réactions
      table.index(['reaction'], 'idx_commentaires_reaction')

      // Index pour améliorer les requêtes par date
      table.index(['created_at'], 'idx_commentaires_created_at')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Supprimer les index
      table.renameColumn('reaction', 'emoji')
      table.dropIndex(['created_at'], 'idx_commentaires_created_at')
      table.dropColumn('updated_at')
    })
  }
}
