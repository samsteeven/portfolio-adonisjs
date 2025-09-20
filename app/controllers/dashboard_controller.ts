import { HttpContext } from '@adonisjs/core/http'
import BlogPost from '#models/blog_post'
import { DateTime } from 'luxon'

export default class DashboardController {
  async index({ inertia }: HttpContext) {
    return inertia.render('admin/dashboard')
  }

  async portfolio({ inertia }: HttpContext) {
    // Récupérer les 6 articles les plus récents
    const recentPosts = await BlogPost.query()
      .where('published', true)
      .where((builder) => {
        builder.whereNull('published_at').orWhere('published_at', '<=', DateTime.now().toSQL())
      })
      .preload('author')
      .preload('tags')
      .orderBy('created_at', 'desc')
      .limit(5)

    return inertia.render('home', {
      recentPosts: inertia.defer(() =>
        recentPosts.map((post) =>
          post.serialize({
            relations: {
              author: { fields: ['username'] },
              tags: { fields: ['name', 'slug', 'color'] },
            },
          })
        )
      ),
    })
  }

  async projectShow({ params, inertia }: HttpContext) {
    return inertia.render('ProjectDetails', { slug: params.slug })
  }
}
