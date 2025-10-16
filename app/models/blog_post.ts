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

  @column.dateTime()
  declare notifiedAt: DateTime | null

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

  // Articles de blog similaires (même tags)
  public async relatedPosts(id: number) {
    return this.tags?.length > 0
      ? await BlogPost.query()
          .where('published', true)
          .where('id', '!=', id)
          .whereHas('tags', (tagQuery) => {
            tagQuery.whereIn(
              'tags.id',
              this.tags.map((tag) => tag.id)
            )
          })
          .preload('author')
          .preload('tags')
          .limit(3)
      : []
  }

  /**
   * Vérifie si l'article a déjà été notifié aux abonnés
   */
  get hasBeenNotified(): boolean {
    return this.notifiedAt !== null
  }

  /**
   * Marquer l'article comme notifié
   */
  public async markAsNotified() {
    if (!this.notifiedAt) {
      this.notifiedAt = DateTime.now()
      await this.save()
    }
  }
}
