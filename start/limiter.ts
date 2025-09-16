/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'

/**
 * Limiteur plus strict pour la route
 * Il limite les tentatives par une combinaison d'adresse IP ET d'adresse e-mail,
 * ce qui est plus précis et plus sûr.
 */
export const limitter = limiter.define('login', (ctx) => {
  const email = ctx.request.input('email')

  // On utilise une clé composite (email + IP) pour être plus précis.
  // Si l'email n'est pas là, la clé sera juste l'IP.
  const key = email ? `${email}_${ctx.request.ip()}` : ctx.request.ip()

  return limiter.allowRequests(5).every('5 minutes').blockFor('30 minutes').usingKey(key)
})
