import { BaseModel, column, belongsTo, manyToMany, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'
import Tag from '#models/tag'

export default class BlogPost extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare excerpt: string

  @column()
  declare content: string

  @column()
  declare featuredImage: string | null

  @column()
  declare published: boolean

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column()
  declare userId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare author: BelongsTo<typeof User>

  @manyToMany(() => Tag, {
    pivotTable: 'blog_post_tags',
  })
  declare tags: ManyToMany<typeof Tag>

  @computed()
  public get photoPathPublicUrl(): string | null {
    if (!this.featuredImage) return null
    if (this.featuredImage.startsWith('https://')) {
      return this.featuredImage
    }
    return `${process.env.APP_URL}/admin/uploads/${this.featuredImage}`
  }

  // Méthode pour trouver par slug
  static async findBySlug(slug: string) {
    return this.query()
      .where('slug', slug)
      .where('published', true)
      .preload('author')
      .preload('tags')
      .first()
  }

  static async findBySlugOrFail(slug: string) {
    return this.query()
      .where('slug', slug)
      .where('published', true)
      .preload('author')
      .preload('tags')
      .firstOrFail()
  }
}
