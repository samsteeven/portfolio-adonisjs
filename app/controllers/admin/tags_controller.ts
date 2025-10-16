// app/controllers/admin/tags_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Tag from '#models/tag'
import vine from '@vinejs/vine'
import { inject } from '@adonisjs/core'
import TagsAuthorizationService from '#services/bouncer/bouncer_technology_service'

@inject()
export default class TagsController {
  public constructor(private tagsAuthorization: TagsAuthorizationService) {}
  async index({ inertia }: HttpContext) {
    const tags = await Tag.query().withCount('blogPosts').orderBy('name', 'asc')
    return inertia.render('admin/tags/index', {
      tags: tags.map((tag) => tag.serialize()),
    })
  }

  async store({ request, response, session, bouncer }: HttpContext) {
    const autorize = await bouncer.with('TagsPolicy').allows('store')
    if (!autorize) {
      return this.tagsAuthorization.handleUnauthorized(response, session)
    }
    const { name, color, description } = await request.validateUsing(
      vine.compile(
        vine.object({
          name: vine.string(),
          color: vine.string(),
          description: vine.string().nullable(),
        })
      )
    )

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    await Tag.create({
      name,
      slug,
      color: color || '#3B82F6',
      description,
    })

    session.flash('success', 'Tag créé avec succès')
    return response.redirect('/admin/tags')
  }

  async update({ params, request, response, session, bouncer }: HttpContext) {
    const autorize = await bouncer.with('TagsPolicy').allows('update')
    if (!autorize) {
      return this.tagsAuthorization.handleUnauthorized(response, session)
    }
    const tag = await Tag.findOrFail(params.id)
    const { name, color, description } = await request.validateUsing(
      vine.compile(
        vine.object({
          name: vine.string().optional(),
          color: vine.string().optional(),
          description: vine.string().optional().nullable(),
        })
      )
    )

    const slug = name
      ?.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    await tag
      .merge({
        name,
        slug,
        color: color || '#3B82F6',
        description,
      })
      .save()

    session.flash('success', 'Tag mis à jour avec succès')
    return response.redirect('/admin/tags')
  }

  async destroy({ params, response, session, bouncer }: HttpContext) {
    const autorize = await bouncer.with('TagsPolicy').allows('delete')
    if (!autorize) {
      return this.tagsAuthorization.handleUnauthorized(response, session)
    }
    const tag = await Tag.findOrFail(params.id)

    // Détacher le tag de tous les articles avant suppression
    await tag.related('blogPosts').detach()
    await tag.delete()

    session.flash('success', 'Tag supprimé avec succès')
    return response.redirect('/admin/tags')
  }
}
