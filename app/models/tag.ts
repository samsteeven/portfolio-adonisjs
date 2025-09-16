import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import BlogPost from '#models/blog_post'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare color: string | null // Pour assigner une couleur au tag

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => BlogPost, {
    pivotTable: 'blog_post_tags',
  })
  declare blogPosts: ManyToMany<typeof BlogPost>

  public serializeExtras() {
    return {
      blogPosts_count: this.$extras.blogPosts_count || 0,
    }
  }
}
