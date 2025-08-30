import Technology from '#models/technology'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { CreateTechnologyDTO, UpdateTechnologyDTO } from '#validators/technologie'

export interface TechnologyFilters {
  search?: string
  category?: string
  page?: number
  limit?: number
}

export class TechnologyService {
  /**
   * Récupère la liste des technologies avec filtres et pagination
   */
  async getTechnologies(
    filters: TechnologyFilters = {}
  ): Promise<ModelPaginatorContract<Technology>> {
    const { search, category, page = 1, limit = 20 } = filters

    const query = Technology.query()

    // Filtre par recherche (nom ou description)
    if (search) {
      query.where((builder) => {
        builder.whereILike('name', `%${search}%`).orWhereILike('description', `%${search}%`)
      })
    }

    // Filtre par catégorie
    if (category) {
      query.where('category', category)
    }

    // Ordre alphabétique par nom
    query.orderBy('name', 'asc')

    return await query.paginate(page, limit)
  }

  /**
   * Récupère les technologies par catégorie
   */
  async getTechnologiesByCategory(): Promise<Record<string, Technology[]>> {
    const technologies = await Technology.query().orderBy('category', 'asc').orderBy('name', 'asc')

    return technologies.reduce(
      (acc, tech) => {
        if (!acc[tech.category]) {
          acc[tech.category] = []
        }
        acc[tech.category].push(tech)
        return acc
      },
      {} as Record<string, Technology[]>
    )
  }

  /**
   * Récupère les catégories uniques
   */
  async getCategories(): Promise<string[]> {
    const result = await Technology.query()
      .select('category')
      .groupBy('category')
      .orderBy('category', 'asc')

    return result.map((item) => item.category)
  }

  /**
   * Récupère une technologie par son ID avec ses projets associés
   */
  async getTechnologyById(
    id: number | string,
    withProjects: boolean = false
  ): Promise<Technology | null> {
    const query = Technology.query().where('id', id)

    if (withProjects) {
      query.preload('projects')
    }

    try {
      return await query.firstOrFail()
    } catch (error) {
      return null
    }
  }

  /**
   * Crée une nouvelle technologie
   */
  async createTechnology(data: CreateTechnologyDTO): Promise<Technology> {
    return await Technology.create(data)
  }

  /**
   * Met à jour une technologie
   */
  async updateTechnology(id: number | string, data: UpdateTechnologyDTO): Promise<Technology> {
    const technology = await this.getTechnologyById(id)
    if (!technology) {
      throw new Error('Technologie introuvable')
    }
    technology.merge(data)
    await technology.save()
    return technology
  }

  /**
   * Récupère les statistiques des technologies
   */
  async getTechnologyStats(): Promise<{
    total: number
    byCategory: Record<string, number>
    mostUsed: Array<{ technology: Technology; projectCount: number }>
  }> {
    // Total des technologies
    const total = await Technology.query().count('* as total').first()

    // Répartition par catégorie
    const categoriesStats = await Technology.query()
      .select('category')
      .count('* as count')
      .groupBy('category')
      .orderBy('category', 'asc')

    const byCategory = categoriesStats.reduce(
      (acc, stat) => {
        acc[stat.category] = Number(stat.$extras.count)
        return acc
      },
      {} as Record<string, number>
    )

    // Technologies les plus utilisées (avec le plus de projets)
    const mostUsed = await Technology.query()
      .select('technologies.*')
      .leftJoin('project_technologies', 'technologies.id', 'project_technologies.technologies_id')
      .groupBy('technologies.id')
      .orderBy(Technology.query().count('project_technologies.project_id'), 'desc')
      .limit(5)

    const mostUsedWithCount = await Promise.all(
      mostUsed.map(async (tech) => {
        await tech.load('projects')
        return {
          technology: tech,
          projectCount: tech.projects.length,
        }
      })
    )

    return {
      total: Number(total?.$extras.total || 0),
      byCategory,
      mostUsed: mostUsedWithCount,
    }
  }
}
