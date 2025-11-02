import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import PortfolioService from '#services/portfolio_service'
import { CACHE_DURATIONS } from '#services/portfolio_service'

export default class CachePortfolio extends BaseCommand {
  static commandName = 'cache:portfolio'
  static description = 'Manage portfolio cache'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const action = await this.prompt.choice('What do you want to do?', [
      { name: 'clear', message: 'Clear all portfolio cache' },
      { name: 'refresh', message: 'Refresh all portfolio cache' },
      { name: 'clear-owner', message: 'Clear portfolio owner cache' },
      { name: 'clear-technologies', message: 'Clear technologies cache' },
      { name: 'clear-skills', message: 'Clear skills cache' },
      { name: 'clear-projects', message: 'Clear projects cache' },
      { name: 'clear-posts', message: 'Clear recent posts cache' },
      { name: 'status', message: 'Show cache status' },
    ])

    switch (action) {
      case 'clear':
        await this.clearAll()
        break
      case 'refresh':
        await this.refreshAll()
        break
      case 'clear-owner':
        await PortfolioService.invalidatePortfolioOwnerCache()
        this.logger.success('Portfolio owner cache cleared')
        break
      case 'clear-technologies':
        await PortfolioService.invalidateTechnologies()
        this.logger.success('Technologies cache cleared')
        break
      case 'clear-skills':
        await PortfolioService.invalidateSkills()
        this.logger.success('Skills cache cleared')
        break
      case 'clear-projects':
        await PortfolioService.invalidateProjects()
        this.logger.success('Projects cache cleared')
        break
      case 'clear-posts':
        await PortfolioService.invalidateRecentPosts()
        this.logger.success('Recent posts cache cleared')
        break
      case 'status':
        await this.showStatus()
        break
    }
  }

  private async clearAll() {
    const spinner = this.logger.await('Clearing all portfolio cache...')
    spinner.start()

    try {
      await Promise.all([
        PortfolioService.invalidateAll(),
        PortfolioService.invalidatePortfolioOwnerCache(),
      ])
      spinner.stop()
      this.logger.success('All portfolio cache cleared successfully')
    } catch (error) {
      spinner.stop()
      this.logger.error('Failed to clear cache')
      this.logger.error(error.message)
    }
  }

  private async refreshAll() {
    const spinner = this.logger.await('Refreshing all portfolio cache...')
    spinner.start()

    try {
      await Promise.all([
        PortfolioService.refreshTechnologies(),
        PortfolioService.refreshSkills(),
        PortfolioService.refreshProjects(),
        PortfolioService.refreshRecentPosts(),
        PortfolioService.refreshPortfolioOwnerCache(),
      ])
      spinner.stop()
      this.logger.success('All portfolio cache refreshed successfully')
    } catch (error) {
      spinner.stop()
      this.logger.error('Failed to refresh cache')
      this.logger.error(error.message)
    }
  }

  private async showStatus() {
    this.logger.info('Cache Status:')
    this.logger.info('─────────────────────────────────────')
    this.logger.info(
      `Technologies TTL: ${CACHE_DURATIONS.TECHNOLOGIES}s (${this.formatDuration(CACHE_DURATIONS.TECHNOLOGIES)})`
    )
    this.logger.info(
      `Skills TTL: ${CACHE_DURATIONS.SKILLS}s (${this.formatDuration(CACHE_DURATIONS.SKILLS)})`
    )
    this.logger.info(
      `Projects TTL: ${CACHE_DURATIONS.PROJECTS}s (${this.formatDuration(CACHE_DURATIONS.PROJECTS)})`
    )
    this.logger.info(
      `Recent Posts TTL: ${CACHE_DURATIONS.RECENT_POSTS}s (${this.formatDuration(CACHE_DURATIONS.RECENT_POSTS)})`
    )
    this.logger.info(
      `Project Detail TTL: ${CACHE_DURATIONS.PROJECT_DETAIL}s (${this.formatDuration(CACHE_DURATIONS.PROJECT_DETAIL)})`
    )
    this.logger.info('─────────────────────────────────────')
  }

  private formatDuration(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)

    return parts.join(' ') || '0m'
  }
}
