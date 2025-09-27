import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import Project from '#models/project'
import BlogPost from '#models/blog_post'
import Commentaire from '#models/commentaire'
import ContactRequest from '#models/contact_request'
import cache from '@adonisjs/cache/services/main'
import { UserRole } from '#enums/user_role'

interface DashboardStats {
  totalUsers: number
  totalProjects: number
  totalBlogPosts: number
  totalComments: number
  totalContactRequests: number
  recentUsers: number
  recentProjects: number
  recentBlogPosts: number
  recentComments: number
  recentContactRequests: number
  growth: {
    users: number
    projects: number
    blogPosts: number
    comments: number
    contactRequests: number
  }
  topProjects: Array<{
    id: number
    title: string
    isActive: boolean
    createdAt: string
  }>
  recentActivity: Array<{
    id: number
    type: string
    title: string
    createdAt: string
  }>
  monthlyData: Array<{
    month: string
    users: number
    projects: number
    blogPosts: number
  }>
}

export default class AdminDashboardController {
  private readonly CACHE_KEY = 'admin:dashboard:stats'
  private readonly CACHE_TTL = '5m' // 5 minutes
  private readonly ACTIVITY_CACHE_KEY = 'admin:dashboard:activity'
  private readonly ACTIVITY_CACHE_TTL = '1m' // 1 minute

  /**
   * Display admin dashboard with cached statistics
   */
  async index({ inertia, auth }: HttpContext) {
    // Check if user has admin role
    const user = auth.user
    const isAdmin = user && user.role === UserRole.ADMIN

    // If user is not admin, show restricted dashboard
    if (!isAdmin) {
      return inertia.render('admin/dashboard', {
        isRestricted: true,
      })
    }

    try {
      // Try to get cached data first
      const cachedStats = await cache.get<DashboardStats>({ key: this.CACHE_KEY })
      if (cachedStats) {
        const lastUpdated = await cache.get<string>({ key: `${this.CACHE_KEY}:timestamp` })
        return inertia.render('admin/dashboard', {
          stats: cachedStats,
          lastUpdated,
          isFromCache: true,
        })
      }

      // If no cache, use deferred loading
      const statsPromise = this.generateStats()

      return inertia.render('admin/dashboard', {
        stats: await statsPromise,
        lastUpdated: DateTime.now().toISO(),
        isFromCache: false,
      })
    } catch (error) {
      console.error('Dashboard error:', error)

      const fallbackStats = await this.getFallbackStats()

      return inertia.render('admin/dashboard', {
        stats: fallbackStats,
        error: 'Certaines données peuvent être incomplètes',
        isFromCache: false,
      })
    }
  }

  /**
   * API endpoint for real-time dashboard updates
   */
  async api({ response }: HttpContext) {
    try {
      let stats = await cache.get<DashboardStats>({ key: this.CACHE_KEY })

      if (!stats) {
        stats = await this.generateStats()
      }

      const lastUpdated = await cache.get<string>({ key: `${this.CACHE_KEY}:timestamp` })

      return response.json({
        success: true,
        data: stats,
        lastUpdated,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
      })
    }
  }

  /**
   * Force refresh dashboard stats (clear cache)
   */
  async refresh({ response }: HttpContext) {
    try {
      await this.clearCache()
      const stats = await this.generateStats()

      return response.json({
        success: true,
        data: stats,
        message: 'Statistiques mises à jour',
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour',
      })
    }
  }

  /**
   * Generate complete dashboard statistics
   */
  private async generateStats(): Promise<DashboardStats> {
    const sevenDaysAgo = DateTime.now().minus({ days: 7 })
    const thirtyDaysAgo = DateTime.now().minus({ days: 30 })

    const [totalCounts, recentCounts, growthData, topProjects, recentActivity, monthlyTrends] =
      await Promise.all([
        this.getTotalCounts(),
        this.getRecentCounts(sevenDaysAgo),
        this.getGrowthData(thirtyDaysAgo),
        this.getTopProjects(),
        this.getRecentActivity(),
        this.getMonthlyTrends(),
      ])

    const stats: DashboardStats = {
      ...totalCounts,
      ...recentCounts,
      growth: growthData,
      topProjects,
      recentActivity,
      monthlyData: monthlyTrends,
    }

    // Cache the results using AdonisJS cache
    await this.cacheStats(stats)

    return stats
  }

  /**
   * Get total counts efficiently
   */
  private async getTotalCounts() {
    const [totalUsers, totalProjects, totalBlogPosts, totalComments, totalContactRequests] =
      await Promise.all([
        User.query().count('* as count').first(),
        Project.query().count('* as count').first(),
        BlogPost.query().count('* as count').first(),
        Commentaire.query().count('* as count').first(),
        ContactRequest.query().count('* as count').first(),
      ])

    return {
      totalUsers: Number(totalUsers?.$extras.count) || 0,
      totalProjects: Number(totalProjects?.$extras.count) || 0,
      totalBlogPosts: Number(totalBlogPosts?.$extras.count) || 0,
      totalComments: Number(totalComments?.$extras.count) || 0,
      totalContactRequests: Number(totalContactRequests?.$extras.count) || 0,
    }
  }

  /**
   * Get recent counts (last 7 days)
   */
  private async getRecentCounts(sevenDaysAgo: DateTime) {
    const [recentUsers, recentProjects, recentBlogPosts, recentComments, recentContactRequests] =
      await Promise.all([
        User.query().where('created_at', '>', sevenDaysAgo.toSQL()!).count('* as count').first(),
        Project.query().where('created_at', '>', sevenDaysAgo.toSQL()!).count('* as count').first(),
        BlogPost.query()
          .where('created_at', '>', sevenDaysAgo.toSQL()!)
          .count('* as count')
          .first(),
        Commentaire.query()
          .where('created_at', '>', sevenDaysAgo.toSQL()!)
          .count('* as count')
          .first(),
        ContactRequest.query()
          .where('created_at', '>', sevenDaysAgo.toSQL()!)
          .count('* as count')
          .first(),
      ])

    return {
      recentUsers: Number(recentUsers?.$extras.count) || 0,
      recentProjects: Number(recentProjects?.$extras.count) || 0,
      recentBlogPosts: Number(recentBlogPosts?.$extras.count) || 0,
      recentComments: Number(recentComments?.$extras.count) || 0,
      recentContactRequests: Number(recentContactRequests?.$extras.count) || 0,
    }
  }

  /**
   * Calculate growth percentages (30 days vs previous 30 days)
   */
  private async getGrowthData(thirtyDaysAgo: DateTime) {
    const sixtyDaysAgo = DateTime.now().minus({ days: 60 })

    const [currentPeriodResults, previousPeriodResults] = await Promise.all([
      Promise.all([
        User.query().where('created_at', '>', thirtyDaysAgo.toSQL()!).count('* as count').first(),
        Project.query()
          .where('created_at', '>', thirtyDaysAgo.toSQL()!)
          .count('* as count')
          .first(),
        BlogPost.query()
          .where('created_at', '>', thirtyDaysAgo.toSQL()!)
          .count('* as count')
          .first(),
        Commentaire.query()
          .where('created_at', '>', thirtyDaysAgo.toSQL()!)
          .count('* as count')
          .first(),
        ContactRequest.query()
          .where('created_at', '>', thirtyDaysAgo.toSQL()!)
          .count('* as count')
          .first(),
      ]),
      Promise.all([
        User.query()
          .whereBetween('created_at', [sixtyDaysAgo.toSQL()!, thirtyDaysAgo.toSQL()!])
          .count('* as count')
          .first(),
        Project.query()
          .whereBetween('created_at', [sixtyDaysAgo.toSQL()!, thirtyDaysAgo.toSQL()!])
          .count('* as count')
          .first(),
        BlogPost.query()
          .whereBetween('created_at', [sixtyDaysAgo.toSQL()!, thirtyDaysAgo.toSQL()!])
          .count('* as count')
          .first(),
        Commentaire.query()
          .whereBetween('created_at', [sixtyDaysAgo.toSQL()!, thirtyDaysAgo.toSQL()!])
          .count('* as count')
          .first(),
        ContactRequest.query()
          .whereBetween('created_at', [sixtyDaysAgo.toSQL()!, thirtyDaysAgo.toSQL()!])
          .count('* as count')
          .first(),
      ]),
    ])

    const current = {
      users: Number(currentPeriodResults[0]?.$extras.count) || 0,
      projects: Number(currentPeriodResults[1]?.$extras.count) || 0,
      blogPosts: Number(currentPeriodResults[2]?.$extras.count) || 0,
      comments: Number(currentPeriodResults[3]?.$extras.count) || 0,
      contactRequests: Number(currentPeriodResults[4]?.$extras.count) || 0,
    }

    const previous = {
      users: Number(previousPeriodResults[0]?.$extras.count) || 0,
      projects: Number(previousPeriodResults[1]?.$extras.count) || 0,
      blogPosts: Number(previousPeriodResults[2]?.$extras.count) || 0,
      comments: Number(previousPeriodResults[3]?.$extras.count) || 0,
      contactRequests: Number(previousPeriodResults[4]?.$extras.count) || 0,
    }

    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    return {
      users: calculateGrowth(current.users, previous.users),
      projects: calculateGrowth(current.projects, previous.projects),
      blogPosts: calculateGrowth(current.blogPosts, previous.blogPosts),
      comments: calculateGrowth(current.comments, previous.comments),
      contactRequests: calculateGrowth(current.contactRequests, previous.contactRequests),
    }
  }

  /**
   * Get top projects (by creation date since we don't have views_count)
   */
  private async getTopProjects() {
    const projects = await Project.query()
      .select('id', 'title', 'is_active', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(5)

    return projects.map((project) => ({
      id: project.id,
      title: project.title,
      isActive: project.isActive,
      createdAt: project.createdAt.toISO()!,
    }))
  }

  /**
   * Get recent activity across all models
   */
  private async getRecentActivity() {
    // Check cache first
    const cached = await cache.get<any[]>({ key: this.ACTIVITY_CACHE_KEY })
    if (cached) {
      return cached
    }

    const [projects, blogPosts, comments, contacts] = await Promise.all([
      Project.query().select('id', 'title', 'created_at').orderBy('created_at', 'desc').limit(3),

      BlogPost.query().select('id', 'title', 'created_at').orderBy('created_at', 'desc').limit(3),

      Commentaire.query()
        .select('id', 'message', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(3),

      ContactRequest.query()
        .select('id', 'first_name', 'last_name', 'message', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(3),
    ])

    const activity = [
      ...projects.map((item) => ({
        id: item.id,
        type: 'project',
        title: item.title,
        createdAt: item.createdAt.toISO()!,
      })),
      ...blogPosts.map((item) => ({
        id: item.id,
        type: 'blog',
        title: item.title,
        createdAt: item.createdAt.toISO()!,
      })),
      ...comments.map((item) => ({
        id: item.id,
        type: 'comment',
        title: item.message.substring(0, 50) + '...',
        createdAt: item.createdAt.toISO()!,
      })),
      ...contacts.map((item) => ({
        id: item.id,
        type: 'contact',
        title: `${item.firstName} ${item.lastName}`,
        createdAt: item.createdAt.toISO()!,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    // Cache activity for 1 minute
    await cache.set({ key: this.ACTIVITY_CACHE_KEY, value: activity, ttl: this.ACTIVITY_CACHE_TTL })

    return activity
  }

  /**
   * Get monthly trends for charts (last 6 months)
   */
  private async getMonthlyTrends() {
    const months = []

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = DateTime.now().minus({ months: i }).startOf('month')
      const nextMonth = month.plus({ months: 1 }).startOf('month')

      const [users, projects, blogPosts] = await Promise.all([
        User.query()
          .whereBetween('created_at', [month.toSQL()!, nextMonth.toSQL()!])
          .count('* as count')
          .first(),
        Project.query()
          .whereBetween('created_at', [month.toSQL()!, nextMonth.toSQL()!])
          .count('* as count')
          .first(),
        BlogPost.query()
          .whereBetween('created_at', [month.toSQL()!, nextMonth.toSQL()!])
          .count('* as count')
          .first(),
      ])

      months.push({
        month: month.toFormat('MMM yyyy'),
        users: Number(users?.$extras.count) || 0,
        projects: Number(projects?.$extras.count) || 0,
        blogPosts: Number(blogPosts?.$extras.count) || 0,
      })
    }

    return months
  }

  /**
   * Cache statistics using AdonisJS cache
   */
  private async cacheStats(stats: DashboardStats) {
    try {
      await Promise.all([
        cache.set({ key: this.CACHE_KEY, value: stats, ttl: this.CACHE_TTL }),
        cache.set({
          key: `${this.CACHE_KEY}:timestamp`,
          value: DateTime.now().toISO(),
          ttl: this.CACHE_TTL,
        }),
      ])
    } catch (error) {
      console.error('Failed to cache dashboard stats:', error)
    }
  }

  /**
   * Clear all dashboard cache
   */
  private async clearCache() {
    try {
      await Promise.all([
        cache.delete({ key: this.CACHE_KEY }),
        cache.delete({ key: `${this.CACHE_KEY}:timestamp` }),
        cache.delete({ key: this.ACTIVITY_CACHE_KEY }),
      ])
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  /**
   * Fallback stats in case of errors
   */
  private async getFallbackStats(): Promise<DashboardStats> {
    const [totalUsers, totalProjects] = await Promise.all([
      User.query().count('* as count').first(),
      Project.query().count('* as count').first(),
    ])

    return {
      totalUsers: Number(totalUsers?.$extras.count) || 0,
      totalProjects: Number(totalProjects?.$extras.count) || 0,
      totalBlogPosts: 0,
      totalComments: 0,
      totalContactRequests: 0,
      recentUsers: 0,
      recentProjects: 0,
      recentBlogPosts: 0,
      recentComments: 0,
      recentContactRequests: 0,
      growth: { users: 0, projects: 0, blogPosts: 0, comments: 0, contactRequests: 0 },
      topProjects: [],
      recentActivity: [],
      monthlyData: [],
    }
  }
  async portfolio({ inertia }: HttpContext) {
    // Récupérer les 6 articles les plus récents
    const recentPosts = await BlogPost.query()
      .where('published', true)
      .where((builder) => {
        builder.whereNull('published_at').orWhere('published_at', '<=', DateTime.now().toSQL())
      })
      .preload('author')
      .preload('tags')
      .orderBy('created_at', 'desc')
      .limit(5)

    return inertia.render('home', {
      recentPosts: inertia.defer(() =>
        recentPosts.map((post) =>
          post.serialize({
            relations: {
              author: { fields: ['username'] },
              tags: { fields: ['name', 'slug', 'color'] },
            },
          })
        )
      ),
    })
  }

  async projectShow({ params, inertia }: HttpContext) {
    return inertia.render('ProjectDetails', { slug: params.slug })
  }

  async profile({ inertia }: HttpContext) {
    return inertia.render('admin/users/profile')
  }
}
