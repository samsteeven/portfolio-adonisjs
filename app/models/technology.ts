// TypeScript
import { DateTime } from 'luxon'
import { BaseModel, column, computed, manyToMany } from '@adonisjs/lucid/orm'
import Project from './project.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Technology extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare category: string

  @column({ columnName: 'img_path' })
  declare imgPath: string | null

  @column({ columnName: 'lien_origin' })
  declare lienOrigin: string | null

  @column()
  declare description: string | null

  @manyToMany(() => Project, {
    pivotTable: 'project_technologies',
    pivotForeignKey: 'technologies_id',
    pivotRelatedForeignKey: 'project_id',
  })
  declare projects: ManyToMany<typeof Project>

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @computed()
  public get imgPathPublicUrl(): string | null {
    if (!this.imgPath) return null
    return `/admin/uploads/${this.imgPath}`
  }
}
