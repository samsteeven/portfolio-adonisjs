import type { HttpContext } from '@adonisjs/core/http'
import BlogPost from '#models/blog_post'
import Tag from '#models/tag'
import FileUploadService from '#services/file_upload/file_upload_technolgy_service'
import { createBlogPostValidator, updateBlogPostValidator } from '#validators/blog_post'
import { DateTime } from 'luxon'
import BlogPostAthorizationService from '#services/bouncer/bouncer_technology_service'
import { inject } from '@adonisjs/core'

@inject()
export default class BlogPostsController {
  constructor(private blogPostAuthorization: BlogPostAthorizationService) {}
  async index({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', '')

    let query = BlogPost.query().preload('author').preload('tags').orderBy('created_at', 'desc')

    if (status === 'published') {
      query = query.where('published', true)
    } else if (status === 'draft') {
      query = query.where('published', false)
    }

    const posts = await query.paginate(page, 10)

    return inertia.render('admin/blog/index', {
      posts: posts.serialize(),
      filters: { status },
    })
  }

  async show({ params, inertia }: HttpContext) {
    const post = await BlogPost.query()
      .where('id', params.id)
      .preload('author')
      .preload('tags')
      .firstOrFail()

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

    return inertia.render('admin/blog/show', {
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
      relatedPosts: relatedPosts.map((p) => p.serialize()),
    })
  }

  async create({ inertia }: HttpContext) {
    const tags = await Tag.query().orderBy('name', 'asc')

    return inertia.render('admin/blog/create', {
      tags: tags.map((tag) => tag.serialize()),
    })
  }

  async store({ request, response, auth, session, logger, bouncer }: HttpContext) {
    const autorize = await bouncer.with('BlogPolicy').allows('store')
    if (!autorize) {
      return this.blogPostAuthorization.handleUnauthorized(response, session)
    }
    const data = await request.validateUsing(createBlogPostValidator)

    // Gestion de l'image uploadée
    const featuredImageFile = data.featuredImage
    let featuredImagePath = data.featuredImageUrl || null

    if (featuredImageFile) {
      try {
        featuredImagePath = await FileUploadService.uploadTechnologyImage(
          featuredImageFile,
          'blogs'
        )
      } catch (error) {
        logger.error("Erreur lors de l'upload de l'image:", error)
        session.flash('error', "Erreur lors de l'upload de l'image")
        return response.redirect().back()
      }
    }

    try {
      const post = await BlogPost.create({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: featuredImagePath,
        published: data.published,
        publishedAt:
          !data.published && data.publishedAt ? DateTime.fromJSDate(data.publishedAt) : null,
        userId: auth.user!.id,
      })

      // Attacher les tags
      if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
        // S'assurer que tous les IDs de tags sont des nombres
        const tagIds = data.tags.map((id) => parseInt(id.toString())).filter((id) => !isNaN(id))
        if (tagIds.length > 0) {
          await post.related('tags').attach(tagIds)
        }
      }

      session.flash('success', 'Article créé avec succès')
      return response.redirect().back()
    } catch (error) {
      logger.error("Erreur lors de la création de l'article:", error)

      // Nettoyer le fichier uploadé en cas d'erreur
      if (featuredImageFile && featuredImagePath) {
        try {
          await FileUploadService.deleteFile(featuredImagePath)
        } catch (unlinkError) {
          logger.error('Erreur lors de la suppression du fichier:', unlinkError)
        }
      }

      session.flash('error', "Erreur lors de la création de l'article")
      return response.redirect().back()
    }
  }

  async edit({ params, inertia }: HttpContext) {
    const post = await BlogPost.query().where('id', params.id).preload('tags').firstOrFail()

    const tags = await Tag.query().orderBy('name', 'asc')

    return inertia.render('admin/blog/edit', {
      post: post.serialize({
        relations: {
          tags: {
            fields: ['id', 'name'],
          },
        },
      }),
      tags: tags.map((tag) => tag.serialize()),
    })
  }

  async update({ params, request, response, session, bouncer, logger }: HttpContext) {
    const autorize = await bouncer.with('BlogPolicy').allows('update')
    if (!autorize) {
      return this.blogPostAuthorization.handleUnauthorized(response, session)
    }
    const post = await BlogPost.findOrFail(params.id)

    const data = await request.validateUsing(updateBlogPostValidator, { meta: { slug: post.slug } })

    let featuredImagePath = post.featuredImage // Garder l'image actuelle par défaut

    // Si un fichier a été uploadé
    if (data.featuredImage) {
      try {
        // Si il y avait déjà une image locale, la remplacer
        if (post.featuredImage && post.featuredImage.startsWith('blogs/')) {
          featuredImagePath = await FileUploadService.replaceTechnologyImage(
            data.featuredImage,
            post.featuredImage,
            'blogs'
          )
        } else {
          // Nouvelle image
          featuredImagePath = await FileUploadService.uploadTechnologyImage(
            data.featuredImage,
            'blogs'
          )
        }
      } catch (error) {
        session.flash('error', "Erreur lors de l'upload de l'image")
        return response.redirect().back()
      }
    }
    // Si une URL externe a été fournie
    else if (data.featuredImageUrl) {
      // Supprimer l'ancienne image locale si elle existait
      if (post.featuredImage && post.featuredImage.startsWith('blogs/')) {
        try {
          await FileUploadService.deleteFile(post.featuredImage)
        } catch (error) {
          // Log l'erreur mais ne pas faire échouer la mise à jour
          logger.warn("Erreur lors de la suppression de l'ancienne image:", error)
        }
      }
      featuredImagePath = data.featuredImageUrl
    }
    // Si pas d'image du tout (ni fichier ni URL)
    else if (data.featuredImageUrl === '') {
      // L'utilisateur veut supprimer l'image
      if (post.featuredImage && post.featuredImage.startsWith('blogs/')) {
        try {
          await FileUploadService.deleteFile(post.featuredImage)
        } catch (error) {
          logger.warn("Erreur lors de la suppression de l'image:", error)
        }
      }
      featuredImagePath = null
    }

    try {
      // Mettre à jour l'article
      await post
        .merge({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          featuredImage: featuredImagePath,
          published: data.published,
          publishedAt:
            !data.published && data.publishedAt ? DateTime.fromJSDate(data.publishedAt) : null,
        })
        .save()

      // Synchroniser les tags
      if (data.tags && Array.isArray(data.tags)) {
        const tagIds = data.tags.map((id) => parseInt(id.toString())).filter((id) => !isNaN(id))
        await post.related('tags').sync(tagIds)
      } else {
        // Si aucun tag, détacher tous les tags
        await post.related('tags').sync([])
      }

      session.flash('success', 'Article mis à jour avec succès')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', "Erreur lors de la mise à jour de l'article")
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session, logger, bouncer }: HttpContext) {
    const autorize = await bouncer.with('BlogPolicy').allows('delete')
    if (!autorize) {
      return this.blogPostAuthorization.handleUnauthorized(response, session)
    }

    const post = await BlogPost.findOrFail(params.id)

    try {
      // Supprimer l'image associée si elle existe et est un fichier local
      if (post.featuredImage && post.featuredImage.startsWith('blogs/')) {
        try {
          await FileUploadService.deleteFile(post.featuredImage)
        } catch (unlinkError) {
          logger.warn('Image non trouvée ou déjà supprimée')
        }
      }

      // Supprimer l'article (les relations avec les tags seront supprimées automatiquement)
      await post.delete()

      session.flash('success', 'Article supprimé avec succès')
      return response.redirect('/admin/blog')
    } catch (error) {
      logger.error("Erreur lors de la suppression de l'article:", error)
      session.flash('error', "Erreur lors de la suppression de l'article")
      return response.redirect().back()
    }
  }
  async toggleStatus({ params, session, response, logger, bouncer }: HttpContext) {
    const autorize = await bouncer.with('BlogPolicy').allows('toggleStatus')
    if (!autorize) {
      return this.blogPostAuthorization.handleUnauthorized(response, session)
    }
    try {
      const post = await BlogPost.findOrFail(params.id)
      post.published = !post.published
      await post.save()
      session.flash('success', `Le post a ete ${post.published ? 'publier' : 'desactiver'}`)
      return response.redirect().back()
    } catch (e) {
      logger.warn("une erreur est survenue lors du changement de status de l'article", e)
      session.flash('error', "Le post n'est pas trouver")
      return response.redirect().back()
    }
  }
}
