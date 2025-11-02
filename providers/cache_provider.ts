import type { ApplicationService } from '@adonisjs/core/types'

export default class CacheProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {
    // Importer le hook de cache pour qu'il soit enregistré
    await import('#models/hooks/cache_invalidation')
  }

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
