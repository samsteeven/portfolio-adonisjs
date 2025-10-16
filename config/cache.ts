import { defineConfig, store, drivers } from '@adonisjs/cache'

const cacheConfig = defineConfig({
  default: 'redis',

  stores: {
    memoryOnly: store().useL1Layer(drivers.memory()),

    /**
     * Cache data using your Lucid-configured database
     */
    database: store().useL2Layer(drivers.database({ connectionName: 'mysql', tableName: 'cache' })),

    /**
     * Cache data in-memory as the primary store and Redis as the secondary store.
     * If your application is running on multiple servers, then in-memory caches
     * need to be synchronized using a bus.
     */
    redis: store()
      .useL1Layer(drivers.memory({ maxSize: '100mb' }))
      .useL2Layer(drivers.redis({ connectionName: 'main' }))
      .useBus(drivers.redisBus({ connectionName: 'main' })),
  },
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
