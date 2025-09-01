import { DateTime } from 'luxon'
import { BaseModel, column, computed, manyToMany } from '@adonisjs/lucid/orm'
import Technology from '#models/technology'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column({ columnName: 'img_path' })
  declare imgPath: string | null

  @column({ columnName: 'demo_path' })
  declare demoPath: string | null

  @column({ columnName: 'github_path' })
  declare githubPath: string | null

  @column({ columnName: 'is_active' })
  declare isActive: boolean

  @manyToMany(() => Technology, {
    pivotTable: 'project_technologies',
    pivotForeignKey: 'project_id',
    pivotRelatedForeignKey: 'technologies_id',
  })
  declare technologies: ManyToMany<typeof Technology>

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
