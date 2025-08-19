import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
  /**
   * Configure CSP policies for your app. Refer documentation
   * to learn more
   */
  csp: {
    enabled: true,
    directives: {
      defaultSrc: ["'self'"],

      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Nécessaire pour Vite en développement
        "'unsafe-eval'", // Parfois requis pour React DevTools
      ],

      styleSrc: [
        "'self'",
        "'unsafe-inline'", // CSS-in-JS et styles inline
        'https://fonts.googleapis.com', // Pour charger les CSS de Google Fonts
      ],

      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],

      fontSrc: ["'self'", 'https://fonts.gstatic.com'],

      connectSrc: [
        "'self'",
        'ws:', // WebSocket pour Vite HMR en dev
        'wss:',
        'https://api.github.com', // ✅ Pour l'API GitHub
      ],
    },
    reportOnly: false, // a true, autorise mais affiche les warnings dans la console
  },

  /**
   * Configure CSRF protection options. Refer documentation
   * to learn more
   */
  csrf: {
    enabled: true,
    exceptRoutes: [],
    enableXsrfCookie: true,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },

  /**
   * Control how your website should be embedded inside
   * iFrames
   */
  xFrame: {
    enabled: true,
    action: 'DENY',
  },

  /**
   * Force browser to always use HTTPS
   */
  hsts: {
    enabled: true,
    maxAge: '180 days',
  },

  /**
   * Disable browsers from sniffing the content type of a
   * response and always rely on the "content-type" header.
   */
  contentTypeSniffing: {
    enabled: true,
  },
})

export default shieldConfig
