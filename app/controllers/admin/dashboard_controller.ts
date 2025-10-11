import type { HttpContext } from '@adonisjs/core/http'
import { UserRole } from '#enums/user_role'
import DashboardService from '#services/dashboard_service'
import { inject } from '@adonisjs/core'

@inject()
export default class AdminDashboardController {
  public constructor(private dashboardService: DashboardService) {}

  /**
   * Display admin dashboard with cached statistics
   */
  async index({ inertia, auth, logger }: HttpContext) {
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
      const stats = await this.dashboardService.getStats()
      const lastUpdated = await this.dashboardService.getLastUpdated()

      return inertia.render('admin/dashboard', {
        stats,
        lastUpdated,
        isFromCache: !!lastUpdated,
      })
    } catch (error) {
      logger.error('Dashboard error:', error)

      const fallbackStats = await this.dashboardService.getFallbackStats()

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
      const stats = await this.dashboardService.getStats()
      const lastUpdated = await this.dashboardService.getLastUpdated()

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
      const stats = await this.dashboardService.refreshStats()

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

  async profile({ inertia }: HttpContext) {
    return inertia.render('admin/users/profile')
  }
}
