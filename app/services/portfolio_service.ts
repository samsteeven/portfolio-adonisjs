import cache from '@adonisjs/cache/services/main'
import Technology from '#models/technology'
import Skill from '#models/skill'
import Project from '#models/project'
import BlogPost from '#models/blog_post'
import { DateTime } from 'luxon'
import User from '#models/user'
import { UserRole } from '#enums/user_role'
import Env from '#start/env'
import env from '#start/env'

/**
 * Durées de cache en secondes
 */
export const CACHE_DURATIONS = {
  TECHNOLOGIES: 60 * 60 * 24 * 7,
  SKILLS: 60 * 60 * 24 * 3,
  PROJECTS: 60 * 60 * 24,
  RECENT_POSTS: 60 * 60 * 2,
  PROJECT_DETAIL: 60 * 60 * 6,
  PORTFOLIO_OWNER_CACHE_DURATION: 60 * 60,
  GITHUB_STAT: 3600000,
} as const
/**
 * Clés de cache
 */
export const CACHE_KEYS = {
  TECHNOLOGIES: 'portfolio:technologies',
  SKILLS: 'portfolio:skills',
  PROJECTS: 'portfolio:projects',
  RECENT_POSTS: 'portfolio:recent_posts',
  PROJECT_DETAIL: (slug: string) => `portfolio:project:${slug}`,
  PORTFOLIO_OWNER_CACHE_KEY: 'portfolio:owner_data',
  GITHUB_STATS: 'github_stats',
} as const
/**
 * Service de gestion des données du portfolio avec cache
 */
export default class PortfolioService {
  /**
   * Récupère toutes les technologies actives avec cache
   */
  static async getTechnologies() {
    return cache.getOrSet({
      key: CACHE_KEYS.TECHNOLOGIES,
      factory: async () => {
        const technologies = await Technology.query()
          .select('id', 'name', 'category', 'img_path', 'description', 'lien_origin')
          .orderBy('category', 'asc')
          .orderBy('name', 'asc')

        return technologies.reduce(
          (acc, tech) => {
            const category = tech.category || 'Autres'
            if (!acc[category]) {
              acc[category] = []
            }
            acc[category].push(tech.serialize())
            return acc
          },
          {} as Record<string, any[]>
        )
      },
      ttl: CACHE_DURATIONS.TECHNOLOGIES,
    })
  }

  /**
   * Récupère toutes les compétences (skills/experiences) actives avec cache
   */
  static async getSkills() {
    return cache.getOrSet({
      key: CACHE_KEYS.SKILLS,
      factory: async () => {
        const skills = await Skill.query()
          .where('is_active', true)
          .select('id', 'name', 'category', 'description', 'image_path')
          .orderBy('category', 'asc')
          .orderBy('name', 'asc')
        return skills.map((skill) => skill.serialize())
      },
      ttl: CACHE_DURATIONS.SKILLS,
    })
  }

  /**
   * Récupère tous les projets actifs avec cache
   */
  static async getProjects() {
    return cache.getOrSet({
      key: CACHE_KEYS.PROJECTS,
      factory: async () => {
        const projects = await Project.query()
          .where('is_active', true)
          .preload('technologies', (query) => {
            query.select('id', 'name', 'img_path')
          })
          .preload('images', (query) => {
            query.select('id', 'project_id', 'image_path', 'isPrimary')
          })
          .orderBy('year', 'desc')
          .orderBy('created_at', 'desc')
        return projects.map((project) =>
          project.serialize({
            relations: {
              technologies: {
                fields: { pick: ['id', 'name', 'imgPath'] },
              },
              images: {
                fields: {
                  pick: ['id', 'imagePath', 'isPrimary', 'imagePublicUrl', 'thumbnailPublicUrl'],
                },
              },
            },
          })
        )
      },
      ttl: CACHE_DURATIONS.PROJECTS,
    })
  }

  /**
   * Récupère un projet spécifique par son slug avec cache
   */
  static async getProjectBySlug(slug: string) {
    return cache.getOrSet({
      key: CACHE_KEYS.PROJECT_DETAIL(slug),
      factory: async () => {
        const project = await Project.query()
          .where('is_active', true)
          .where((builder) => {
            builder.whereRaw('LOWER(REPLACE(title, " ", "-")) = ?', [slug.toLowerCase()])
          })
          .preload('technologies', (query) => {
            query.select('id', 'name', 'img_path')
          })
          .preload('images', (query) => {
            query.select('id', 'project_id', 'image_path', 'is_primary').orderBy('order', 'asc')
          })
          .firstOrFail()

        return project.serialize({
          relations: {
            technologies: {
              fields: { pick: ['id', 'name', 'imgPath', 'imgPathPublicUrl'] },
            },
            images: {
              fields: { pick: ['id', 'imagePath', 'imagePublicUrl', 'isPrimary', 'order'] },
            },
          },
        })
      },
      ttl: CACHE_DURATIONS.PROJECT_DETAIL,
    })
  }

  /**
   * Récupère les articles de blog récents avec cache
   */
  static async getRecentPosts(limit: number = 5) {
    return cache.getOrSet({
      key: CACHE_KEYS.RECENT_POSTS,
      factory: async () => {
        const posts = await BlogPost.query()
          .where('published', true)
          .where((builder) => {
            builder.whereNull('published_at').orWhere('published_at', '<=', DateTime.now().toSQL())
          })
          .preload('author', (query) => {
            query.select('id', 'username')
          })
          .preload('tags', (query) => {
            query.select('id', 'name', 'slug', 'color')
          })
          .orderBy('created_at', 'desc')
          .limit(limit)

        return posts.map((post) =>
          post.serialize({
            relations: {
              author: { fields: { pick: ['id', 'username'] } },
              tags: { fields: { pick: ['id', 'name', 'slug', 'color'] } },
            },
          })
        )
      },
      ttl: CACHE_DURATIONS.RECENT_POSTS,
    })
  }

  /**
   * Récupère les données du propriétaire du portfolio avec cache
   * Ces données sont utilisées dans Banner, AboutMe, et potentiellement d'autres composants
   */
  static async getPortfolioOwnerData() {
    return cache.getOrSet({
      key: CACHE_KEYS.PORTFOLIO_OWNER_CACHE_KEY,
      factory: async () => {
        // Récupérer l'utilisateur qui représente le portfolio (par exemple le premier admin)
        const owner = await User.query()
          .where('role', UserRole.ADMIN)
          .where('email', Env.get('ADMIN_EMAIL'))
          .preload('subInfo')
          .orderBy('id', 'asc')
          .first()

        if (!owner) return null

        return owner.serialize({
          fields: {
            pick: ['id', 'username', 'email'],
          },
          relations: {
            subInfo: {
              fields: {
                pick: [
                  'profilGithub',
                  'profilLinkedin',
                  'profilTwitter',
                  'profilMail',
                  'profilDiscord',
                  'photoPath',
                  'photoPathPublicUrl',
                  'phone',
                  'bio',
                  'bio2',
                  'cv',
                  'cvPublicUrl',
                ],
              },
            },
          },
        })
      },
      ttl: CACHE_DURATIONS.PORTFOLIO_OWNER_CACHE_DURATION,
    })
  }

  static async getRepoStats(owner = 'samsteeven', repo = 'mon_potfolio') {
    return cache.getOrSet({
      key: CACHE_KEYS.GITHUB_STATS,
      factory: async () => {
        const token = env.get('GITHUB_TOKEN')

        if (!token) {
          console.warn('GITHUB_TOKEN not configured, skipping GitHub stats fetch')
          return null
        }

        try {
          const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github+json',
              'User-Agent': 'portfolio-app',
            },
          })

          if (!response.ok) {
            console.error(`GitHub API error: ${response.status}`)
            return null
          }

          const data: any = await response.json()

          return {
            stars: data.stargazers_count,
            forks: data.forks_count,
          }
        } catch (error) {
          console.error('Error fetching GitHub stats:', error)
          return null
        }
      },
    })
  }
  static async invalidateRepoStats() {
    await cache.delete({ key: CACHE_KEYS.GITHUB_STATS })
  }

  /**
   * Méthode statique pour invalider le cache du propriétaire
   * À appeler quand les données du User sont modifiées
   */
  static async invalidatePortfolioOwnerCache() {
    await cache.delete({ key: CACHE_KEYS.PORTFOLIO_OWNER_CACHE_KEY })
  }

  /**
   * Rafraîchit le cache du propriétaire
   */
  static async refreshPortfolioOwnerCache() {
    await this.invalidatePortfolioOwnerCache()
    // Le cache sera automatiquement rechargé à la prochaine requête
  }

  /**
   * Invalide le cache des technologies
   */
  static async invalidateTechnologies() {
    await cache.delete({ key: CACHE_KEYS.TECHNOLOGIES })
  }

  /**
   * Invalide le cache des compétences
   */
  static async invalidateSkills() {
    await cache.delete({ key: CACHE_KEYS.SKILLS })
  }

  /**
   * Invalide le cache des projets
   */
  static async invalidateProjects() {
    await cache.delete({ key: CACHE_KEYS.PROJECTS })
    const projects = await Project.query().select('title')
    for (const project of projects) {
      await cache.delete({ key: CACHE_KEYS.PROJECT_DETAIL(project.slug) })
    }
  }

  /**
   * Invalide le cache d'un projet spécifique
   */
  static async invalidateProject(slug: string) {
    await cache.delete({ key: CACHE_KEYS.PROJECT_DETAIL(slug) })
    await cache.delete({ key: CACHE_KEYS.PROJECTS })
  }

  /**
   * Invalide le cache des articles récents
   */
  static async invalidateRecentPosts() {
    await cache.delete({ key: CACHE_KEYS.RECENT_POSTS })
  }

  /**
   * Invalide tout le cache du portfolio
   */
  static async invalidateAll() {
    await Promise.all([
      this.invalidateTechnologies(),
      this.invalidateSkills(),
      this.invalidateProjects(),
      this.invalidateRecentPosts(),
      this.invalidateRepoStats(),
    ])
  }

  /**
   * Rafraîchit (invalide puis recharge) le cache des technologies
   */
  static async refreshTechnologies() {
    await this.invalidateTechnologies()
    return this.getTechnologies()
  }

  /**
   * Rafraîchit le cache des compétences
   */
  static async refreshSkills() {
    await this.invalidateSkills()
    return this.getSkills()
  }

  /**
   * Rafraîchit le cache des projets
   */
  static async refreshProjects() {
    await this.invalidateProjects()
    return this.getProjects()
  }

  /**
   * Rafraîchit le cache des articles récents
   */
  static async refreshRecentPosts() {
    await this.invalidateRecentPosts()
    return this.getRecentPosts()
  }
}
