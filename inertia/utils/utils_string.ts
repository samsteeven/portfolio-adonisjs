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
