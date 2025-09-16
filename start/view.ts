import edge from 'edge.js'
import { edgeIconify } from 'edge-iconify'

/**
 * Register a plugin
 */
edge.use(edgeIconify)

/**
 * Define a global property
 */
edge.global('appUrl', 'http://' + process.env.HOST + ':' + process.env.PORT)
