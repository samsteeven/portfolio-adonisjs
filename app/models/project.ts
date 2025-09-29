import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, hasMany, computed } from '@adonisjs/lucid/orm'
import Technology from '#models/technology'
import ProjectImage from '#models/project_image'
import type { ManyToMany, HasMany } from '@adonisjs/lucid/types/relations'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare year: string

  @column()
  declare role: string | null

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

  @hasMany(() => ProjectImage)
  declare images: HasMany<typeof ProjectImage>

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @computed()
  get slug(): string {
    return this.title.toLowerCase().replace(/ /g, '-')
  }
}
