import { BaseCommand } from '@adonisjs/core/ace'
import BlogSchedulerService from '#services/scheduler/blog_scheduler_service'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CheckScheduledPosts extends BaseCommand {
  static commandName = 'blog:check-scheduled'
  static description = 'Vérifier et publier les articles programmés'
  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Vérification des articles programmés...')

    try {
      await BlogSchedulerService.checkAndPublishScheduledPosts()
      this.logger.info('Vérification terminée avec succès')
    } catch (error) {
      this.logger.error('Erreur lors de la vérification:', error)
    }
  }
}
