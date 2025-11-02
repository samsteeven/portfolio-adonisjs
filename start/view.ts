import edge from 'edge.js'
import { edgeIconify } from 'edge-iconify'
import { DateTime } from 'luxon'
import DOMPurify from 'isomorphic-dompurify'
import env from '#start/env'

/**
 * Register a plugin
 */
edge.use(edgeIconify)

/**
 * Define a global property
 */
const url = env.get('NODE_ENV') === 'development' ? 'http://localhost:3333' : env.get('APP_URL')
edge.global('appUrl', url)

/**
 * Helper pour formater les dates dans les templates Edge
 */
edge.global('formatDate', (date: string | Date | DateTime, format: string = 'full') => {
  let luxonDate: DateTime

  if (date instanceof Date) {
    luxonDate = DateTime.fromJSDate(date)
  } else if (typeof date === 'string') {
    luxonDate = DateTime.fromISO(date)
  } else if (DateTime.isDateTime(date)) {
    luxonDate = date
  } else {
    return 'Date invalide'
  }

  // Si la date n'est pas valide, retourner une chaîne vide
  if (!luxonDate.isValid) {
    return 'Date invalide'
  }

  // Formats prédéfinis
  switch (format) {
    case 'short':
      return luxonDate.setLocale('fr-FR').toLocaleString(DateTime.DATE_SHORT)
    case 'medium':
      return luxonDate.setLocale('fr-FR').toLocaleString(DateTime.DATE_MED)
    case 'long':
      return luxonDate.setLocale('fr-FR').toLocaleString(DateTime.DATE_FULL)
    case 'full':
      return luxonDate.setLocale('fr-FR').toLocaleString(DateTime.DATETIME_FULL)
    case 'relative':
      return luxonDate.setLocale('fr-FR').toRelative()
    default:
      return luxonDate.setLocale('fr-FR').toFormat(format)
  }
})

/**
 * Helper pour rendre du HTML sécurisé dans les templates Edge
 * Utilise la même configuration que le composant React SafeHTML
 */
edge.global('safeHTML', (html: string) => {
  if (!html) return ''

  // Configuration identique à celle du composant React SafeHTML
  const config = {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'blockquote',
      'code',
      'pre',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'span',
      'div',
    ],
    ALLOWED_ATTR: [
      'href',
      'title',
      'target',
      'rel',
      'src',
      'alt',
      'width',
      'height',
      'class',
      'id',
      'style',
    ],
    ALLOW_DATA_ATTR: false,
  }

  // Nettoyer le HTML avec la même configuration
  return DOMPurify.sanitize(html, config)
})
