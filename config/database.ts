import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'
import Env from '#start/env'

const dbConfig = defineConfig({
  connection: Env.get('DB_CONNECTION', 'sqlite'),
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      pool: {
        afterCreate: (conn, done) => {
          conn.query('SET default_storage_engine=InnoDB', (err: any) => {
            done(err, conn)
          })
        },
      },
    },
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: env.get('DB_DATABASE', './database/mybd.sqlite'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      useNullAsDefault: true,
    },
  },
})

export default dbConfig
