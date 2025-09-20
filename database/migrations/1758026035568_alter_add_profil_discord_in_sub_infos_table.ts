import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sub_infos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('profil_discord', 50).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('profil_discord')
    })
  }
}
