import Faq from '#models/faq'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import FaqAuthorization from '#services/bouncer/bouncer_technology_service'

import { inject } from '@adonisjs/core'

@inject()
export default class AdminFaqController {
  constructor(private FaqAuthorizationService: FaqAuthorization) {}
  // Liste toutes les FAQ
  public async index({ inertia }: HttpContext) {
    const faqs = await Faq.all()
    return inertia.render('admin/faq/index', { faqs })
  }

  // Crée une nouvelle FAQ
  public async store({ request, response, session, bouncer }: HttpContext) {
    const authorize = await bouncer.with('FaqPolicy').allows('store')
    if (!authorize) {
      return this.FaqAuthorizationService.handleUnauthorized(response, session)
    }
    const data = await request.validateUsing(
      vine.compile(
        vine.object({
          question: vine.string().maxLength(255),
          answer: vine.string(),
        })
      )
    )

    await Faq.create(data)
    session.flash('success', 'Le tag a bien ete creer')
    return response.redirect().back()
  }

  // Met à jour une FAQ
  public async update({ params, request, response, session, bouncer }: HttpContext) {
    const authorize = await bouncer.with('FaqPolicy').allows('update')
    if (!authorize) {
      return this.FaqAuthorizationService.handleUnauthorized(response, session)
    }
    const faq = await Faq.findOrFail(params.id)
    const data = await request.validateUsing(
      vine.compile(
        vine.object({
          question: vine.string().maxLength(255).optional(),
          answer: vine.string().optional(),
        })
      )
    )
    faq.merge(data)
    await faq.save()
    session.flash('success', 'Le tag a bien modifier')
    return response.redirect().back()
  }

  // Supprime une FAQ
  public async destroy({ params, response, session, bouncer }: HttpContext) {
    const authorize = await bouncer.with('FaqPolicy').allows('delete')
    if (!authorize) {
      return this.FaqAuthorizationService.handleUnauthorized(response, session)
    }
    const faq = await Faq.findOrFail(params.id)
    await faq.delete()
    session.flash('success', 'Le tag a ete supprimer')
    return response.redirect().back()
  }

  public async indexPublic({ inertia }: HttpContext) {
    const faqs = await Faq.query().orderBy('created_at')

    return inertia.render('faq', {
      faqs,
    })
  }
}
