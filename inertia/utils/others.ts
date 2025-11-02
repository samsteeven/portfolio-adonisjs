import { ProjectType } from '~/types/projets'

// Fonction pour obtenir l'image principale d'un projet
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

// Obtenir l'image principale (isPrimary) ou la première image
export const getProjectThumbnail = (project: ProjectType) => {
  const primaryImage = project.images?.find((img) => img.isPrimary)
  return primaryImage?.imagePublicUrl || project.images?.[0]?.imagePublicUrl || '/placeholder.jpg'
}
