import vine from '@vinejs/vine'

const validateSlug = vine
  .string()
  .minLength(3)
  .maxLength(255)
  .regex(/^[a-z0-9-]+$/)
  .unique(async (db, value, field) => {
    if (!field.meta.slug) return false
    const slug = await db
      .from('blog_posts')
      .where('slug', value)
      .whereNot('slug', field.meta.slug)
      .first()
    return !slug
  })
export const createBlogPostValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).maxLength(255),
    slug: vine
      .string()
      .minLength(3)
      .maxLength(255)
      .regex(/^[a-z0-9-]+$/)
      .unique({ table: 'blog_posts', column: 'slug' }),
    excerpt: vine.string().minLength(10).maxLength(500),
    content: vine.string(),
    featuredImage: vine
      .file({
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .nullable(),
    featuredImageUrl: vine.string().url().optional(),
    published: vine.boolean(),
    publishedAt: vine.date().optional(),
    tags: vine.array(vine.number()).optional(),
  })
)

export const updateBlogPostValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).maxLength(255),
    slug: validateSlug.clone().optional(),
    excerpt: vine.string().minLength(10).maxLength(500),
    content: vine.string().minLength(50),
    featuredImage: vine
      .file({
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .nullable()
      .optional(),
    featuredImageUrl: vine.string().url().optional(),
    published: vine.boolean().optional(),
    publishedAt: vine.date().optional(),
    tags: vine.array(vine.number()).optional(),
  })
)
