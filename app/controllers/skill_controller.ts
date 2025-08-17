import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { SkillService } from '#services/skill_service'

@inject()
export default class SkillController {
  constructor(private skillService: SkillService) {}

  /**
   * Affiche la liste des compétences avec pagination et filtres
   */
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const category = request.input('category', 'all')

    const skills = await this.skillService.getSkills({
      page,
      limit,
      search,
      category,
    })

    return inertia.render('admin/skills', { skills })
  }

  /**
   * Affiche le formulaire de création de compétence
   */
  async create({ inertia }: HttpContext) {
    const categories = await this.skillService.getCategories()

    return inertia.render('admin/skills/create', { categories })
  }

  /**
   * Enregistre une nouvelle compétence
   */
  async store({ request, response, session }: HttpContext) {
    try {
      const skillData = request.only([
        'name',
        'description',
        'category',
        'imagePath',
        'isActive',
      ])

      await this.skillService.createSkill(skillData)

      session.flash('success', 'Compétence créée avec succès')
      return response.redirect().toRoute('admin.skills')
    } catch (error) {
      session.flash('error', 'Erreur lors de la création de la compétence')
      return response.redirect().back()
    }
  }

  /**
   * Affiche une compétence spécifique
   */
  async show({ inertia, params }: HttpContext) {
    const skill = await this.skillService.getSkillById(params.id)
    return inertia.render('admin/skills/show', { skill })
  }

  /**
   * Affiche le formulaire d'édition de compétence
   */
  async edit({ inertia, params }: HttpContext) {
    const skill = await this.skillService.getSkillById(params.id)
    const categories = await this.skillService.getCategories()

    return inertia.render('admin/skills/edit', { skill, categories })
  }

  /**
   * Met à jour une compétence
   */
  async update({ request, response, params, session }: HttpContext) {
    try {
      const skillData = request.only([
        'name',
        'description',
        'category',
        'imagePath',
        'isActive',
      ])

      await this.skillService.updateSkill(params.id, skillData)

      session.flash('success', 'Compétence mise à jour avec succès')
      return response.redirect().toRoute('admin.skills')
    } catch (error) {
      session.flash('error', 'Erreur lors de la mise à jour de la compétence')
      return response.redirect().back()
    }
  }

  /**
   * Supprime une compétence
   */
  async destroy({ response, params, session }: HttpContext) {
    try {
      await this.skillService.deleteSkill(params.id)

      session.flash('success', 'Compétence supprimée avec succès')
      return response.redirect().toRoute('admin.skills')
    } catch (error) {
      session.flash('error', 'Erreur lors de la suppression de la compétence')
      return response.redirect().back()
    }
  }

  /**
   * Active/désactive une compétence
   */
  async toggleStatus({ response, params, session }: HttpContext) {
    try {
      await this.skillService.toggleSkillStatus(params.id)
      session.flash('success', 'Statut de la compétence mis à jour avec succès')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors de la mise à jour du statut')
      return response.redirect().back()
    }
  }
}
