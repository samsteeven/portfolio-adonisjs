import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { TechnologyService } from '#services/technology_service'

@inject()
export default class TechnologyController {
  constructor(private technologyService: TechnologyService) {}

  /**
   * Affiche la liste des technologies avec pagination et filtres
   */
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const category = request.input('category', 'all')

    const technologies = await this.technologyService.getTechnologies({
      page,
      limit,
      search,
      category,
    })

    return inertia.render('admin/technologies', { technologies })
  }

  /**
   * Affiche le formulaire de création de technologie
   */
  async create({ inertia }: HttpContext) {
    const categories = await this.technologyService.getCategories()

    return inertia.render('admin/technologies/create', { categories })
  }

  /**
   * Enregistre une nouvelle technologie
   */
  async store({ request, response, session }: HttpContext) {
    try {
      const technologyData = request.only([
        'name',
        'description',
        'category',
        'imgPath',
        'lienOrigin',
        'isActive',
      ])

      await this.technologyService.createTechnology(technologyData)

      session.flash('success', 'Technologie créée avec succès')
      return response.redirect().toRoute('admin.technologies')
    } catch (error) {
      session.flash('error', 'Erreur lors de la création de la technologie')
      return response.redirect().back()
    }
  }

  /**
   * Affiche une technologie spécifique
   */
  async show({ inertia, params }: HttpContext) {
    const technology = await this.technologyService.getTechnologyById(params.id)
    return inertia.render('admin/technologies/show', { technology })
  }

  /**
   * Affiche le formulaire d'édition de technologie
   */
  async edit({ inertia, params }: HttpContext) {
    const technology = await this.technologyService.getTechnologyById(params.id)
    const categories = await this.technologyService.getCategories()

    return inertia.render('admin/technologies/edit', {
      technology,
      categories,
    })
  }

  /**
   * Met à jour une technologie
   */
  async update({ request, response, params, session }: HttpContext) {
    try {
      const technologyData = request.only([
        'name',
        'description',
        'category',
        'imgPath',
        'lienOrigin',
        'isActive',
      ])

      await this.technologyService.updateTechnology(params.id, technologyData)

      session.flash('success', 'Technologie mise à jour avec succès')
      return response.redirect().toRoute('admin.technologies')
    } catch (error) {
      session.flash('error', 'Erreur lors de la mise à jour de la technologie')
      return response.redirect().back()
    }
  }

  /**
   * Supprime une technologie
   */
  async destroy({ response, params, session }: HttpContext) {
    try {
      await this.technologyService.deleteTechnology(params.id)

      session.flash('success', 'Technologie supprimée avec succès')
      return response.redirect().toRoute('admin.technologies')
    } catch (error) {
      session.flash('error', 'Erreur lors de la suppression de la technologie')
      return response.redirect().back()
    }
  }
}
