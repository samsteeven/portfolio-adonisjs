import { Link, router } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Image,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Share2,
  Download,
  ExternalLink,
  Github,
} from 'lucide-react'
import { ProjectType } from '~/types/projets'
import { toast } from 'sonner'

interface Props {
  project: ProjectType
}

export default function ShowProject({ project }: Props) {
  const [isClient, setIsClient] = useState(false)

  // État pour le modal de suppression
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  })

  // Résoudre l'hydratation
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fonction pour formater les dates
  const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
    if (!isClient) return '...'
    return new Date(dateString).toLocaleDateString('fr-FR', options)
  }

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
          toast.error('Erreur lors de la suppression')
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
        onSuccess: () => {
          toast.success(`Projet ${project.isActive ? 'désactivé' : 'activé'} avec succès`)
        },
        onError: () => {
          toast.error('Erreur lors de la modification du statut')
        },
      }
    )
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copié dans le presse-papier')
    } catch (error) {
      toast.error('Erreur lors de la copie')
    }
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

  return (
    <>
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

                {/* Liens externes */}
                <div className="flex items-center gap-4 mb-2">
                  {project.demoPath && (
                    <a
                      href={project.demoPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Voir la démo
                    </a>
                  )}
                  {project.githubPath && (
                    <a
                      href={project.githubPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
                    >
                      <Github className="h-4 w-4" />
                      Voir le code
                    </a>
                  )}
                </div>

                <p className="text-gray-600">
                  Projet créé le{' '}
                  {formatDate(project.createdAt.toString(), {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {project.updatedAt && (
                    <span>
                      {' • Modifié le '}
                      {formatDate(project.updatedAt.toString(), {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </p>
              </div>

              {/* Actions principales */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={toggleStatus}
                  variant="outline"
                  className={
                    project.isActive
                      ? 'text-orange-600 hover:bg-orange-50 border-none'
                      : 'text-green-600 hover:bg-green-50 border-none'
                  }
                >
                  {project.isActive ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Activer
                    </>
                  )}
                </Button>

                <Link href={`/admin/projects/${project.id}/edit`}>
                  <Button variant="outline" className="border-none text-black">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </Link>

                <Button
                  onClick={handleDeleteClick}
                  variant="outline"
                  className="text-red-600 hover:text-red-800 border-none hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image principale */}
              <Card className="overflow-hidden bg-white">
                <div className="aspect-video bg-gray-100 relative">
                  {project.imgPathPublicUrl ? (
                    <>
                      <img
                        src={project.imgPathPublicUrl}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                      {/* Overlay avec actions d'image */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/90 hover:bg-white border-none"
                            onClick={() => window.open(project.imgPathPublicUrl!, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/90 hover:bg-white border-none"
                            onClick={() => {
                              const link = document.createElement('a')
                              if (project.imgPathPublicUrl != null) {
                                link.href = project.imgPathPublicUrl
                              }
                              link.download = `${project.title}.jpg`
                              link.click()
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center">
                      <Image className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-sm">Aucune image associée</p>
                      <Link href={`/admin/projects/${project.id}/edit`} className="mt-2">
                        <Button size="sm" variant="outline" className="border-none">
                          <Edit className="h-4 w-4 mr-1" />
                          Ajouter une image
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>

              {/* Description */}
              <Card className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>Description</span>
                  {!project.description && (
                    <span className="text-sm font-normal text-gray-500">(vide)</span>
                  )}
                </h2>

                {project.description ? (
                  <div className="prose prose-gray max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {project.description}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Aucune description pour ce projet</p>
                    <Link href={`/admin/projects/${project.id}/edit`}>
                      <Button size="sm" variant="outline" className="border-none">
                        <Edit className="h-4 w-4 mr-1" />
                        Ajouter une description
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <Card className="p-6 bg-white">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-4">
                    Technologies utilisées ({project.technologies.length})
                  </h2>

                  {Object.keys(groupedTechnologies).length > 1 ? (
                    // Grouped by category
                    <div className="space-y-6">
                      {Object.entries(groupedTechnologies).map(([category, techs]) => (
                        <div key={category}>
                          <p className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">
                            {category} ({techs.length})
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {techs.map((tech) => (
                              <div
                                key={tech.id}
                                className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all"
                              >
                                {tech.imgPathPublicUrl && (
                                  <img
                                    src={tech.imgPathPublicUrl}
                                    alt={tech.name}
                                    className="w-4 h-4 object-contain"
                                  />
                                )}
                                <span className="font-medium">{tech.name}</span>
                                {tech.lienOrigin && (
                                  <a
                                    href={tech.lienOrigin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Simple list
                    <div className="flex flex-wrap gap-3">
                      {project.technologies.map((tech) => (
                        <div
                          key={tech.id}
                          className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all"
                        >
                          {tech.imgPathPublicUrl && (
                            <img
                              src={tech.imgPathPublicUrl}
                              alt={tech.name}
                              className="w-4 h-4 object-contain"
                            />
                          )}
                          <span className="font-medium">{tech.name}</span>
                          {tech.lienOrigin && (
                            <a
                              href={tech.lienOrigin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* Liens et ressources */}
              {(project.demoPath || project.githubPath) && (
                <Card className="p-6 bg-white">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Liens et ressources</h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {project.demoPath && (
                      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <ExternalLink className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Démonstration</h3>
                            <p className="text-sm text-gray-600">Version live du projet</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-white rounded text-sm font-mono truncate">
                            {project.demoPath}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(project.demoPath!)}
                            className="border-none"
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                          <a href={project.demoPath} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Ouvrir
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}

                    {project.githubPath && (
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Github className="h-5 w-5 text-gray-700" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Code source</h3>
                            <p className="text-sm text-gray-600">Repository GitHub</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-white rounded text-sm font-mono truncate">
                            {project.githubPath}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(project.githubPath!)}
                            className="border-none"
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                          <a href={project.githubPath} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="border border-gray-300">
                              Ouvrir
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Statistiques (placeholder) */}
              <Card className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques</h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-purple-800">Vues</div>
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

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Conseil :</strong> Partagez ce projet sur vos réseaux pour augmenter
                    sa visibilité.
                  </p>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Informations rapides */}
              <Card className="p-6 bg-white">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID du projet
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        #{project.id}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(project.id.toString())}
                        className="h-6 w-6 p-0 border-none"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <div className="flex items-center gap-2">
                      {project.isActive ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 font-medium">Actif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 font-medium">Inactif</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de création
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {formatDate(project.createdAt.toString(), {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {project.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dernière modification
                      </label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDate(project.updatedAt.toString(), {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Actions rapides */}
              <Card className="p-6 bg-white">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>

                <div className="space-y-3">
                  <Link href={`/admin/projects/${project.id}/edit`} className="block">
                    <Button variant="outline" className="w-full justify-start border-none">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier le projet
                    </Button>
                  </Link>

                  <Button
                    onClick={toggleStatus}
                    variant="outline"
                    className="w-full justify-start border-none"
                  >
                    {project.isActive ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Activer
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => copyToClipboard(window.location.href)}
                    variant="outline"
                    className="w-full justify-start border-none"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Copier le lien
                  </Button>

                  <hr className="my-2 bg-gray-500" />

                  <Button
                    onClick={handleDeleteClick}
                    variant="outline"
                    className="w-full justify-start border-none text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </Card>

              {/* Aperçu public */}
              <Card className="p-6 bg-white border-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu public</h3>

                <div className="rounded-lg p-4 bg-gray-50">
                  <div className="text-center">
                    {project.imgPathPublicUrl && (
                      <div className="w-20 h-20 mx-auto mb-3 rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={project.imgPathPublicUrl}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>

                    {project.description && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {project.description}
                      </p>
                    )}

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1 mb-3">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span
                            key={tech.id}
                            className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            {tech.name}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-center gap-2">
                      {project.demoPath && (
                        <Button size="sm" variant="outline" className="text-xs border-none">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Démo
                        </Button>
                      )}
                      {project.githubPath && (
                        <Button size="sm" variant="outline" className="text-xs border-none">
                          <Github className="h-3 w-3 mr-1" />
                          Code
                        </Button>
                      )}
                    </div>
                  </div>

                  {!project.isActive && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
                      <p className="text-xs text-yellow-800">
                        ⚠️ Ce projet n'est pas visible publiquement
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-none"
                    onClick={() => window.open(`/projects/${project.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir sur le site
                  </Button>
                </div>
              </Card>

              {/* Métadonnées techniques */}
              <Card className="p-6 bg-white border-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Métadonnées</h3>

                <div className="space-y-3 text-sm">
                  {project.imgPathPublicUrl && (
                    <div>
                      <label className="font-medium text-gray-700">Chemin de l'image:</label>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="flex-1 px-2 py-1 bg-gray-100 rounded text-xs font-mono truncate">
                          {project.imgPathPublicUrl}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(project.imgPathPublicUrl!)}
                          className="h-6 w-6 p-0 flex-shrink-0 border-none"
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="font-medium text-gray-700">Technologies:</label>
                    <div className="mt-1">
                      <span className="text-gray-600">
                        {project.technologies?.length || 0} sélectionnées
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-gray-700">Longueur description:</label>
                    <div className="mt-1">
                      <span className="text-gray-600">
                        {project.description ? project.description.length : 0} caractères
                      </span>
                    </div>
                  </div>

                  {isClient && (
                    <div>
                      <label className="font-medium text-gray-700">Dernière activité:</label>
                      <div className="mt-1">
                        <span className="text-gray-600">
                          {project.updatedAt
                            ? `Modifié il y a ${Math.floor((Date.now() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} jour(s)`
                            : `Créé il y a ${Math.floor((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24))} jour(s)`}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="font-medium text-gray-700">Liens externes:</label>
                    <div className="mt-1">
                      <span className="text-gray-600">
                        {[project.demoPath, project.githubPath].filter(Boolean).length} configuré(s)
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le projet"
        message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce projet ?"
        itemName={project.title}
        isLoading={deleteModal.isLoading}
      />
    </>
  )
}

ShowProject.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Détails projet"
    description="Voir les détails d'un projet"
    currentPath="/admin/projects"
  >
    {page}
  </AdminLayout>
)
