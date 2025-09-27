import { defineConfig, store, drivers } from '@adonisjs/cache'

const cacheConfig = defineConfig({
  default: 'database',

  stores: {
    memoryOnly: store().useL1Layer(drivers.memory()),

    /**
     * Cache data using your Lucid-configured database
     */
    database: store().useL2Layer(drivers.database({ connectionName: 'mysql' })),
  },
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
