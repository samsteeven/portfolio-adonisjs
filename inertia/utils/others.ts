// Fonction pour obtenir l'image principale d'un projet
import { ProjectType } from '~/types/projets'

export const getProjectMainImage = (project: ProjectType): string | null => {
  // Priorité: image principale des images multiples > ancienne image unique
  if (project.images && project.images.length > 0) {
    const primaryImage = project.images.find((img) => img.isPrimary)
    if (primaryImage) return primaryImage.imagePublicUrl

    // Si pas d'image principale définie, prendre la première
    return project.images[0].imagePublicUrl
  }

  return null
}
