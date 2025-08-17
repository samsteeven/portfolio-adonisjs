import { inject } from '@adonisjs/core'
import Technology from '#models/technology'
import { Exception } from '@adonisjs/core/exceptions'

@inject()
export class TechnologyService {
  /**
   * Récupère la liste des technologies avec pagination et filtres
   */
  async getTechnologies({
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
    const query = Technology.query()

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
   * Récupère une technologie par son ID
   */
  async getTechnologyById(id: string | number) {
    return await Technology.findOrFail(id)
  }

  /**
   * Récupère les catégories disponibles (depuis les technologies existantes)
   */
  async getCategories() {
    const categories = await Technology.query()
      .select('category')
      .whereNotNull('category')
      .distinct()
      .orderBy('category', 'asc')

    return categories.map((cat: any) => ({ id: cat.category, name: cat.category }))
  }

  /**
   * Crée une nouvelle technologie
   */
  async createTechnology(data: {
    name: string
    description: string
    category: string
    imgPath: string
    lienOrigin: string
    isActive: boolean
  }) {
    // Vérifier si le nom existe déjà
    const existingTechnology = await Technology.findBy('name', data.name)
    if (existingTechnology) {
      throw new Exception('Une technologie avec ce nom existe déjà', {
        status: 400,
        code: 'NAME_ALREADY_EXISTS',
      })
    }

    // Créer la technologie
    return await Technology.create({
      name: data.name,
      description: data.description,
      category: data.category,
      imgPath: data.imgPath,
      lienOrigin: data.lienOrigin,
    })
  }

  /**
   * Met à jour une technologie
   */
  async updateTechnology(
    id: string | number,
    data: {
      name?: string
      description?: string
      category?: string
      imgPath?: string
      lienOrigin?: string
      isActive?: boolean
    }
  ) {
    const technology = await Technology.findOrFail(id)

    // Vérifier si le nom existe déjà (sauf pour la technologie actuelle)
    if (data.name && data.name !== technology.name) {
      const existingTechnology = await Technology.findBy('name', data.name)
      if (existingTechnology) {
        throw new Exception('Une technologie avec ce nom existe déjà', {
          status: 400,
          code: 'NAME_ALREADY_EXISTS',
        })
      }
    }

    // Mettre à jour la technologie
    technology.merge({
      name: data.name,
      description: data.description,
      category: data.category,
      imgPath: data.imgPath,
      lienOrigin: data.lienOrigin,
    })
    await technology.save()

    return technology
  }

  /**
   * Supprime une technologie
   */
  async deleteTechnology(id: string | number) {
    const technology = await Technology.findOrFail(id)
    await technology.delete()
    return true
  }

  /**
   * Récupère les statistiques des technologies
   */
  async getTechnologyStats() {
    const total = await Technology.query().count('* as total').first()

    return {
      total: total?.$extras.total || 0,
    }
  }
}
