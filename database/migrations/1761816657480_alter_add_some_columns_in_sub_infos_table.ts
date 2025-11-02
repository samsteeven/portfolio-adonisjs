import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sub_infos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('bio2').nullable().after('bio')
      table.string('cv').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('bio2')
      table.dropColumn('cv')
    })
  }
}
