import { Head, Link, router } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'
import AdminLayout from '~/layout/AdminLayout'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Images,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Github,
  User,
  Star,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Check,
} from 'lucide-react'
import { ProjectShowProps } from '~/types/projets'
import { toast } from 'sonner'

export default function ShowProject({ project }: ProjectShowProps) {
  const [isClient, setIsClient] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isReordering, setIsReordering] = useState(false)
  const [reorderedImages, setReorderedImages] = useState<Array<any>>([])
  const [primaryImageId, setPrimaryImageId] = useState<number | null>(null)

  // État pour le modal de suppression
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  })

  // Résoudre l'hydratation
  useEffect(() => {
    setIsClient(true)

    if (project.images) {
      const sortedImages = [...project.images].sort((a, b) => a.order - b.order)
      setReorderedImages(sortedImages)

      const primary = project.images.find((img: any) => img.isPrimary)
      if (primary) {
        setPrimaryImageId(primary.id)
      }
    }
  }, [project])

  // Fonction pour formater les dates
  const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
    if (!isClient) return '...'
    return new Date(dateString).toLocaleDateString('fr-FR', options)
  }

  // Fonction pour obtenir toutes les images du projet
  const getAllImages = (): Array<{ url: string; isPrimary: boolean; id?: number }> => {
    const allImages: Array<{ url: string; isPrimary: boolean; id?: number }> = []

    // Ajouter les images multiples d'abord
    if (project.images && project.images.length > 0) {
      project.images
        .sort((a, b) => a.order - b.order)
        .forEach((img) => {
          allImages.push({
            url: img.imagePublicUrl,
            isPrimary: img.isPrimary,
            id: img.id,
          })
        })
    }

    return allImages
  }

  const allImages = getAllImages()
  const hasMultipleImages = allImages.length > 1

  const handleDeleteClick = () => {
    setDeleteModal({
      isOpen: true,
      isLoading: false,
    })
  }

  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, isLoading: true }))

    try {
      router.delete(`/admin/projects/${project.id}`, {
        onSuccess: () => {
          router.visit('/admin/projects')
        },
        onError: () => {
          setDeleteModal((prev) => ({ ...prev, isLoading: false }))
        },
      })
    } catch (error) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      isLoading: false,
    })
  }

  const toggleStatus = () => {
    router.patch(
      `/admin/projects/${project.id}/toggle-status`,
      {},
      {
        onError: () => {
          toast.error('Erreur lors de la modification du statut')
        },
      }
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  // Grouper les technologies par catégorie
  const groupedTechnologies =
    project.technologies?.reduce(
      (acc, tech) => {
        const category = tech.category || 'Autres'
        if (!acc[category]) acc[category] = []
        acc[category].push(tech)
        return acc
      },
      {} as Record<string, typeof project.technologies>
    ) || {}

  // Fonctions pour la réorganisation des images
  const startReordering = () => {
    setIsReordering(true)
    if (project.images) {
      const sortedImages = [...project.images].sort((a, b) => a.order - b.order)
      setReorderedImages(sortedImages)
    }
  }

  const cancelReordering = () => {
    setIsReordering(false)
    if (project.images) {
      const sortedImages = [...project.images].sort((a, b) => a.order - b.order)
      setReorderedImages(sortedImages)
    }
  }

  const saveReordering = () => {
    const imageOrders = reorderedImages.map((img, index) => ({
      id: img.id,
      order: index,
    }))

    router.patch(
      `/admin/projects/${project.id}/reorder-images`,
      { imageOrders },
      {
        onSuccess: () => {
          setIsReordering(false)
          toast.success('Images réorganisées avec succès')
          router.reload({ only: ['project'] })
        },
        onError: () => {
          toast.error('Erreur lors de la réorganisation des images')
        },
      }
    )
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...reorderedImages]
    if (direction === 'up' && index > 0) {
      ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
      setReorderedImages(newImages)
    } else if (direction === 'down' && index < newImages.length - 1) {
      ;[newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]]
      setReorderedImages(newImages)
    }
  }

  // Fonction pour définir l'image principale
  const setPrimaryImage = (imageId: number) => {
    router.patch(
      `/admin/projects/${project.id}/set-primary-image`,
      { imageId },
      {
        onSuccess: () => {
          setPrimaryImageId(imageId)
          toast.success('Image principale définie avec succès')
          router.reload({ only: ['project'] })
        },
        onError: () => {
          toast.error("Erreur lors de la définition de l'image principale")
        },
      }
    )
  }

  return (
    <>
      <Head title={`Projet ${project.title}`} />
      <div className="min-h-screen sm:bg-gray-50 sm:p-3">
        <div className="px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href={'/admin/projects'}
                className="inline-flex items-center text-base text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour aux projets
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                  <span className="text-lg text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-lg">
                    {project.year}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      project.isActive
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {project.isActive ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Actif
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Inactif
                      </>
                    )}
                  </span>
                </div>

                {/* Rôle */}
                {project.role && (
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 font-medium">{project.role}</span>
                  </div>
                )}

                {/* Liens externes */}
                <div className="flex items-center gap-4 mb-2">
                  {project.demoPath && (
                    <a
                      href={project.demoPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Démo
                    </a>
                  )}
                  {project.githubPath && (
                    <a
                      href={project.githubPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Modifier
                </Link>
                <button
                  onClick={toggleStatus}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {project.isActive ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Activer
                    </>
                  )}
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>

          {/* Galerie d'images */}
          {allImages.length > 0 && (
            <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Galerie d'images</h2>
                {!isReordering && allImages.length > 1 && (
                  <div className="flex gap-2">
                    <button
                      onClick={startReordering}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <GripVertical className="h-4 w-4" />
                      Réorganiser
                    </button>
                  </div>
                )}
                {isReordering && (
                  <div className="flex gap-2">
                    <button
                      onClick={cancelReordering}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={saveReordering}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Enregistrer
                    </button>
                  </div>
                )}
              </div>

              {isReordering ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reorderedImages.map((image, index) => (
                    <div key={image.id} className="border rounded-lg overflow-hidden">
                      <div className="relative">
                        <img
                          src={image.imagePublicUrl}
                          alt={`Image ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        {image.id === primaryImageId && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Principal
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            onClick={() => moveImage(index, 'up')}
                            disabled={index === 0}
                            className={`p-1 rounded ${
                              index === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-white hover:bg-gray-100'
                            }`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveImage(index, 'down')}
                            disabled={index === reorderedImages.length - 1}
                            className={`p-1 rounded ${
                              index === reorderedImages.length - 1
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-white hover:bg-gray-100'
                            }`}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 flex justify-between items-center">
                        <span className="text-sm text-gray-600">Position: {index + 1}</span>
                        <button
                          onClick={() => setPrimaryImage(image.id)}
                          className={`px-2 py-1 text-xs rounded ${
                            image.id === primaryImageId
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {image.id === primaryImageId ? 'Principal' : 'Définir principal'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                    </>
                  )}

                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                    {allImages.length > 0 ? (
                      <img
                        src={allImages[currentImageIndex]?.url}
                        alt={`Image ${currentImageIndex + 1} de ${project.title}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Images className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {hasMultipleImages && (
                    <div className="mt-4 flex justify-center gap-2">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                          aria-label={`Voir l'image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {allImages[currentImageIndex]?.isPrimary && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200 max-w-max mx-auto">
                      <Star className="w-4 h-4" />
                      Image principale du projet
                    </div>
                  )}
                </div>
              )}

              {allImages.length > 1 && !isReordering && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  {allImages.length} images au total. Utilisez les flèches pour naviguer.
                </div>
              )}
            </div>
          )}

          {/* Contenu principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Description */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              {project.description ? (
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              ) : (
                <p className="text-gray-500 italic">Aucune description fournie.</p>
              )}
            </div>

            {/* Informations secondaires */}
            <div className="space-y-6">
              {/* Dates */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dates</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Création</p>
                      <p className="font-medium">
                        {formatDate(project.createdAt.toString(), {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  {project.updatedAt && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Dernière mise à jour</p>
                        <p className="font-medium">
                          {formatDate(project.updatedAt.toString(), {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Technologies</h3>
                  <div className="space-y-4">
                    {Object.entries(groupedTechnologies).map(([category, techs]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">
                          {category}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {techs.map((tech) => (
                            <span
                              key={tech.id}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                            >
                              {tech.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistiques */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{allImages.length}</div>
                    <div className="text-sm text-purple-800">Images</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {project.technologies?.length || 0}
                    </div>
                    <div className="text-sm text-blue-800">Technologies</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {project.isActive ? '100%' : '0%'}
                    </div>
                    <div className="text-sm text-green-800">Visibilité</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {isClient
                        ? Math.floor(
                            (Date.now() - new Date(project.createdAt).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : '...'}
                    </div>
                    <div className="text-sm text-orange-800">Jours</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          isLoading={deleteModal.isLoading}
          onConfirm={handleDeleteConfirm}
          onClose={handleDeleteCancel}
          title="Supprimer le projet"
          message={`Êtes-vous sûr de vouloir supprimer définitivement le projet "${project.title}" ? Cette action est irréversible.`}
        />
      </div>
    </>
  )
}

ShowProject.layout = (page: React.ReactNode) => (
  <AdminLayout description="Détails du projet" currentPath="/admin/projects">
    {page}
  </AdminLayout>
)
