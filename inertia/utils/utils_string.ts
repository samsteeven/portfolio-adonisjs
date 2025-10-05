import { DateTime } from 'luxon'

// Fonction pour générer les initiales
export const getInitials = (username: string): string => {
  return username
    .split(' ')
    .map((name) => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// Formatage de la date d'inscription
export const formatMemberSince = (dateString: string): string => {
  try {
    const date = DateTime.fromISO(dateString)
    return `Membre depuis le ${date.toFormat('dd LLL yyyy', { locale: 'fr' })}`
  } catch {
    return "Date d'inscription inconnue"
  }
}

// Auto-generate slug from title
export const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const formatDateTimeLocal = (dateString: string | null) => {
  if (!dateString) return ''
  // remplace l'espace entre date et heure par un "T"
  return dateString.replace(' ', 'T').slice(0, 16)
}

export const truncateText = (text: string, maxLength: number = 100) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

export const readingTime = (text: string) => {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  const minutes = words / wordsPerMinute

  if (minutes < 1) {
    return "Moins d'1 min"
  } else if (minutes < 1.5) {
    return '1 min'
  } else {
    return `${Math.ceil(minutes)} min`
  }
}

export const formatLocalDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
