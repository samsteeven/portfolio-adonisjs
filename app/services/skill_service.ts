import { inject } from '@adonisjs/core'
import Skill from '#models/skill'
import { Exception } from '@adonisjs/core/exceptions'

@inject()
export class SkillService {
  /**
   * Récupère la liste des compétences avec pagination et filtres
   */
  async getSkills({
    page,
    limit,
    search,
    category,
  }: {
    page: number
    limit: number
    search: string
    category: string
  }) {
    const query = Skill.query()

    // Filtre par recherche
    if (search) {
      query.where((subQuery: any) => {
        subQuery.where('name', 'like', `%${search}%`).orWhere('description', 'like', `%${search}%`)
      })
    }

    // Filtre par catégorie (champ string simple)
    if (category && category !== 'all') {
      query.where('category', category)
    }

    // Pagination
    return await query.orderBy('created_at', 'desc').paginate(page, limit)
  }

  /**
   * Récupère une compétence par son ID
   */
  async getSkillById(id: string | number) {
    return await Skill.findOrFail(id)
  }

  /**
   * Récupère les catégories disponibles (depuis les compétences existantes)
   */
  async getCategories() {
    const categories = await Skill.query()
      .select('category')
      .whereNotNull('category')
      .distinct()
      .orderBy('category', 'asc')

    return categories.map((cat: any) => ({ id: cat.category, name: cat.category }))
  }

  /**
   * Crée une nouvelle compétence
   */
  async createSkill(data: {
    name: string
    description: string
    category: string
    imagePath: string
    isActive: boolean
  }) {
    // Vérifier si le nom existe déjà
    const existingSkill = await Skill.findBy('name', data.name)
    if (existingSkill) {
      throw new Exception('Une compétence avec ce nom existe déjà', {
        status: 400,
        code: 'NAME_ALREADY_EXISTS',
      })
    }

    // Créer la compétence
    return await Skill.create({
      name: data.name,
      description: data.description,
      category: data.category,
      imagePath: data.imagePath,
      isActive: data.isActive,
    })
  }

  /**
   * Met à jour une compétence
   */
  async updateSkill(
    id: string | number,
    data: {
      name?: string
      description?: string
      category?: string
      imagePath?: string
      isActive?: boolean
    }
  ) {
    const skill = await Skill.findOrFail(id)

    // Vérifier si le nom existe déjà (sauf pour la compétence actuelle)
    if (data.name && data.name !== skill.name) {
      const existingSkill = await Skill.findBy('name', data.name)
      if (existingSkill) {
        throw new Exception('Une compétence avec ce nom existe déjà', {
          status: 400,
          code: 'NAME_ALREADY_EXISTS',
        })
      }
    }

    // Mettre à jour la compétence
    skill.merge({
      name: data.name,
      description: data.description,
      category: data.category,
      imagePath: data.imagePath,
      isActive: data.isActive,
    })
    await skill.save()

    return skill
  }

  /**
   * Supprime une compétence
   */
  async deleteSkill(id: string | number) {
    const skill = await Skill.findOrFail(id)
    await skill.delete()
    return true
  }

  /**
   * Active/désactive une compétence
   */
  async toggleSkillStatus(id: string | number) {
    const skill = await Skill.findOrFail(id)
    skill.isActive = !skill.isActive
    await skill.save()
    return skill
  }

  /**
   * Récupère les statistiques des compétences
   */
  async getSkillStats() {
    const total = await Skill.query().count('* as total').first()
    const active = await Skill.query().where('is_active', true).count('* as count').first()
    const inactive = await Skill.query().where('is_active', false).count('* as count').first()

    return {
      total: total?.$extras.total || 0,
      active: active?.$extras.count || 0,
      inactive: inactive?.$extras.count || 0,
    }
  }
}
