import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'commentaires'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // 2. Supprimer les colonnes name et email
      table.dropColumn('name')
      table.dropColumn('email')
      // Informations pour les visiteurs non connectés
      table.string('guest_name').nullable()
      table.string('guest_email').nullable()
      table.string('guest_phone').nullable()

      // Informations de géolocalisation
      table.string('ip_address').nullable()
      table.string('country').nullable()
      table.string('country_code', 2).nullable()
      table.string('region').nullable()
      table.string('region_name').nullable()
      table.string('city').nullable()
      table.string('zip_code').nullable()
      table.decimal('latitude', 10, 8).nullable()
      table.decimal('longitude', 11, 8).nullable()
      table.string('timezone').nullable()
      table.string('isp').nullable()
      table.string('organization').nullable()

      // Informations techniques
      table.text('user_agent').nullable()
      table.string('referer').nullable()

      // Type de commentaire
      table.enum('comment_type', ['authenticated', 'guest']).defaultTo('guest')

      table.dropForeign(['user_id'])
      table.integer('user_id').unsigned().nullable().alter()
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')

      // Index pour améliorer les performances des requêtes
      table.index(['comment_type'])
      table.index(['country'])
      table.index(['city'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns(
        'guest_name',
        'guest_email',
        'guest_phone',
        'ip_address',
        'country',
        'country_code',
        'region',
        'region_name',
        'city',
        'zip_code',
        'latitude',
        'longitude',
        'timezone',
        'isp',
        'organization',
        'user_agent',
        'referer',
        'comment_type'
      )
      table.dropForeign(['user_id'])
      table.integer('user_id').unsigned().notNullable().alter()
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
    })
  }
}
