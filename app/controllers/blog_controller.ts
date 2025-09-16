import BlogPost from '#models/blog_post'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class BlogController {
  async index({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')
    const tagSlug = request.input('tag', '')

    let query = BlogPost.query()
      .where('published', true)
      .where((builder) => {
        builder.whereNull('published_at').orWhere('published_at', '<=', DateTime.now().toSQL())
      })
      .preload('author')
      .preload('tags')
      .orderBy('updated_at', 'desc')

    if (search) {
      query = query.where((builder) => {
        builder.where('title', 'like', `%${search}%`).orWhere('content', 'like', `%${search}%`)
      })
    }

    if (tagSlug) {
      query = query.whereHas('tags', (tagQuery) => {
        tagQuery.where('slug', tagSlug)
      })
    }

    const posts = await query.paginate(page, 10)

    return inertia.render('blog', {
      posts: posts.serialize(),
      currentTag: tagSlug,
    })
  }

  async show({ params, inertia, response, session }: HttpContext) {
    try {
      // Chercher par slug nettoyé OU slug original (au cas où)
      const post = await BlogPost.query()
        .where('slug', params.slug)
        .where('published', true)
        .where((builder) => {
          builder.whereNull('published_at').orWhere('published_at', '<=', DateTime.now().toSQL())
        })
        .preload('author')
        .preload('tags')
        .first()

      if (!post) {
        session.flash('error', 'Article non trouvé')
        return response.redirect().back()
      }
      // Articles similaires (même tags)
      const relatedPosts =
        post.tags?.length > 0
          ? await BlogPost.query()
              .where('published', true)
              .where('id', '!=', post.id)
              .whereHas('tags', (tagQuery) => {
                tagQuery.whereIn(
                  'tags.id',
                  post.tags.map((tag) => tag.id)
                )
              })
              .preload('author')
              .preload('tags')
              .limit(3)
          : []

      return inertia.render('show_blog', {
        post: post.serialize({
          relations: {
            author: {
              fields: ['id', 'username'],
            },
            tags: {
              fields: ['id', 'name', 'slug', 'color'],
            },
          },
        }),
        relatedPosts: relatedPosts.map((p) =>
          p.serialize({
            relations: {
              tags: {
                fields: ['name', 'slug', 'color'],
              },
            },
          })
        ),
      })
    } catch (error) {
      session.flash('error', "Erreur lors de la recuperation de l'article")
      return response.redirect().back()
    }
  }
}
