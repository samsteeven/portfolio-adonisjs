import type { HttpContext } from '@adonisjs/core/http'
import BlogPost from '#models/blog_post'
import Tag from '#models/tag'
import FileUploadService from '#services/file_upload/file_upload_technolgy_service'
import { createBlogPostValidator, updateBlogPostValidator } from '#validators/blog_post'
import { DateTime } from 'luxon'
import BlogPostAthorizationService from '#services/bouncer/bouncer_technology_service'
import { inject } from '@adonisjs/core'
import BlogSchedulerService from '#services/scheduler/blog_scheduler_service'

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
      posts: posts.serialize({
        relations: {
          author: {
            fields: { pick: ['username'] },
          },
          tags: {
            fields: { pick: ['id', 'name', 'slug', 'color'] },
          },
        },
      }),
      filters: { status },
    })
  }

  async show({ params, inertia }: HttpContext) {
    const post = await BlogPost.query()
      .where('id', params.id)
      .preload('author')
      .preload('tags')
      .firstOrFail()

    return inertia.render('admin/blog/show', {
      post: post.serialize({
        relations: {
          author: {
            fields: { pick: ['username'] },
          },
          tags: {
            fields: { pick: ['id', 'name', 'slug', 'color'] },
          },
        },
      }),
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
      // Déterminer si l'article doit être publié maintenant ou plus tard
      const shouldSchedule = data.publishedAt !== undefined && data.publishedAt !== null

      const post = await BlogPost.create({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: featuredImagePath,
        published: data.published,
        publishedAt: data.publishedAt ? DateTime.fromJSDate(data.publishedAt) : null,
        userId: auth.user!.id,
      })

      // Attacher les tags
      if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
        const tagIds = data.tags.map((id) => parseInt(id.toString())).filter((id) => !isNaN(id))
        if (tagIds.length > 0) {
          await post.related('tags').attach(tagIds)
        }
      }

      // Si l'article est publié et qu'une date est définie, programmer la publication
      if (data.published && shouldSchedule) {
        await BlogSchedulerService.schedulePost(post)
        const publishDate = DateTime.fromJSDate(data.publishedAt!)
        session.flash(
          'success',
          `Article programmé pour le ${publishDate.toFormat('dd/MM/yyyy à HH:mm')}`
        )
      }
      // Si l'article est publié immédiatement (sans date programmée) et n'a pas encore été notifié
      else if (data.published && !shouldSchedule) {
        await BlogSchedulerService.notifySubscribersOfNewPost(post)
        await post.markAsNotified()
        session.flash('success', 'Article créé et publié avec succès')
      }
      // Sinon c'est un brouillon
      else {
        session.flash('success', 'Brouillon créé avec succès')
      }

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
    const post = await BlogPost.query()
      .where('id', params.id)
      .preload('author')
      .preload('tags')
      .firstOrFail()

    const tags = await Tag.query().orderBy('name', 'asc')

    return inertia.render('admin/blog/edit', {
      post: post.serialize({
        relations: {
          author: {
            fields: { pick: ['username'] },
          },
          tags: {
            fields: { pick: ['id', 'name', 'slug', 'color'] },
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

    let featuredImagePath = post.featuredImage

    if (data.featuredImage) {
      try {
        if (post.featuredImage && post.featuredImage.startsWith('blogs/')) {
          featuredImagePath = await FileUploadService.replaceTechnologyImage(
            data.featuredImage,
            post.featuredImage,
            'blogs'
          )
        } else {
          featuredImagePath = await FileUploadService.uploadTechnologyImage(
            data.featuredImage,
            'blogs'
          )
        }
      } catch (error) {
        session.flash('error', "Erreur lors de l'upload de l'image")
        return response.redirect().back()
      }
    } else if (data.featuredImageUrl) {
      if (post.featuredImage && post.featuredImage.startsWith('blogs/')) {
        try {
          await FileUploadService.deleteFile(post.featuredImage)
        } catch (error) {
          logger.warn("Erreur lors de la suppression de l'ancienne image:", error)
        }
      }
      featuredImagePath = data.featuredImageUrl
    } else if (data.featuredImageUrl === '') {
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
      // Sauvegarder l'état avant modification
      const wasPublished = post.published
      const shouldSchedule = data.publishedAt !== undefined && data.publishedAt !== null

      // Mettre à jour l'article
      await post
        .merge({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          featuredImage: featuredImagePath,
          published: data.published !== undefined ? data.published : post.published,
          publishedAt: data.publishedAt ? DateTime.fromJSDate(data.publishedAt) : null,
        })
        .save()

      // Synchroniser les tags
      if (data.tags && Array.isArray(data.tags)) {
        const tagIds = data.tags.map((id) => parseInt(id.toString())).filter((id) => !isNaN(id))
        await post.related('tags').sync(tagIds)
      } else {
        await post.related('tags').sync([])
      }

      // Gérer les notifications/programmation
      // Cas 1: Article qui passe de brouillon à publié (première publication) et n'a pas encore été notifié
      if (post.published && !wasPublished && !shouldSchedule && !post.hasBeenNotified) {
        await BlogSchedulerService.notifySubscribersOfNewPost(post)
        await post.markAsNotified()
        session.flash('success', 'Article publié et abonnés notifiés')
      }
      // Cas 2: Article programmé
      else if (post.published && !post.hasBeenNotified && shouldSchedule) {
        await BlogSchedulerService.schedulePost(post)
        const publishDate = DateTime.fromJSDate(data.publishedAt!)
        session.flash(
          'success',
          `Article programmé pour le ${publishDate.toFormat('dd/MM/yyyy à HH:mm')}`
        )
      }
      // Cas 3: Mise à jour simple (déjà publié ou remis en brouillon)
      else {
        session.flash('success', 'Article mis à jour avec succès')
      }

      return response.redirect().back()
    } catch (error) {
      logger.error("Erreur lors de la mise à jour de l'article:", error)
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

      const wasPublished = post.published

      // Si l'article est publié et a une date de publication future, annuler la programmation
      if (
        post.published &&
        !post.hasBeenNotified &&
        post.publishedAt &&
        post.publishedAt > DateTime.now()
      ) {
        post.publishedAt = null
      }

      // Toggle le statut
      post.published = !post.published
      await post.save()

      // Si on vient de publier pour la première fois et n'a pas encore été notifié
      if (post.published && !wasPublished && !post.hasBeenNotified) {
        await BlogSchedulerService.notifySubscribersOfNewPost(post)
        session.flash('success', 'Article publié et abonnés notifiés')
      } else {
        session.flash('success', `Article ${post.published ? 'publié' : 'mis en brouillon'}`)
      }

      return response.redirect().back()
    } catch (e) {
      logger.warn("une erreur est survenue lors du changement de status de l'article", e)
      session.flash('error', "Le post n'est pas trouvé")
      return response.redirect().back()
    }
  }
}
