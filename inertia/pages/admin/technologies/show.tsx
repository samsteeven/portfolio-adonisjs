import { Head, Link, router } from '@inertiajs/react'
import {
  ArrowLeft,
  Edit3,
  Trash2,
  ExternalLink,
  Code2,
  Calendar,
  Tag,
  FileText,
  Folder,
  Eye,
  AlertTriangle,
} from 'lucide-react'
import { Technology } from '~/types/technology'
import AdminLayout from '~/layout/AdminLayout'
import React, { useEffect, useState } from 'react'
import { getProjectMainImage } from '~/utils/others'
import SafeHTML from '~/components/safeHTML'

export default function TechnologiesShow({ technology }: { technology: Technology }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fonction pour formater les dates
  const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
    if (!isClient) return '...'
    return new Date(dateString).toLocaleDateString('fr-FR', options)
  }
  const handleDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la technologie "${technology.name}" ?`)) {
      router.delete(`/admin/technologies/${technology.id}`)
    }
  }

  return (
    <>
      <Head title={technology.name} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link
                  href={'/admin/technologies'}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{technology.name}</h1>
                  <p className="text-gray-600">Détails de la technologie</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/technologies/${technology.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Modifier
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Carte principale */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                        {technology.imgPathPublicUrl ? (
                          <img
                            src={technology.imgPathPublicUrl}
                            alt={technology.name}
                            className="w-20 h-20 object-contain"
                          />
                        ) : (
                          <Code2 className="w-16 h-16 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Informations principales */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {technology.name}
                          </h2>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              <Tag className="w-3 h-3" />
                              {technology.category}
                            </span>
                            {technology.lienOrigin && (
                              <a
                                href={technology.lienOrigin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Site officiel
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {technology.description ? (
                        <div className="mb-6">
                          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                            <FileText className="w-4 h-4" />
                            Description
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <SafeHTML className="text-gray-700" html={technology.description} />
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <p className="text-gray-500 text-center">Aucune description disponible</p>
                        </div>
                      )}

                      {/* Métadonnées */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Ajoutée le {formatDate(technology.createdAt.toString())}</span>
                        </div>
                        {technology.updatedAt && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Modifié le {formatDate(technology.updatedAt.toString())}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projets utilisant cette technologie */}
              {technology.projects && technology.projects.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Folder className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Projets utilisant cette technologie ({technology.projects.length})
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {technology.projects.map((project) => {
                        const mainImage = getProjectMainImage(project)
                        return (
                          <div
                            key={project.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                {mainImage ? (
                                  <img
                                    src={mainImage}
                                    alt={project.title}
                                    className="w-10 h-10 object-cover rounded-lg"
                                  />
                                ) : (
                                  <Folder className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4
                                  className="font-medium text-gray-900 mb-1 hover:cursor-pointer"
                                  onClick={() => router.visit(`/admin/projects/${project.id}`)}
                                >
                                  {project.title}
                                </h4>
                                {project.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {project.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <span
                                    className={`inline-block w-2 h-2 rounded-full ${
                                      project.isActive ? 'bg-green-500' : 'bg-gray-400'
                                    }`}
                                  />
                                  <span className="text-xs text-gray-500">
                                    {project.isActive ? 'Actif' : 'Inactif'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Folder className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Projets utilisant cette technologie
                      </h3>
                    </div>

                    <div className="text-center py-8">
                      <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">
                        Cette technologie n'est utilisée dans aucun projet pour le moment.
                      </p>
                      <Link
                        href={'/admin/projects/create'}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Créer un projet
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Colonne latérale */}
            <div className="space-y-6">
              {/* Actions rapides */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Actions rapides</h3>
                  <div className="space-y-2">
                    <Link
                      href={`/admin/technologies/${technology.id}/edit`}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Modifier cette technologie
                    </Link>

                    <Link
                      href={'/admin/technologies/create'}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      <Code2 className="w-4 h-4" />
                      Ajouter une nouvelle technologie
                    </Link>

                    <Link
                      href={'/admin/technologies'}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Voir toutes les technologies
                    </Link>

                    <hr className="my-2" />

                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer cette technologie
                    </button>
                  </div>
                </div>
              </div>

              {/* Informations techniques */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Informations techniques</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">ID :</span>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {technology.id}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Catégorie :</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {technology.category}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Image :</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          technology.imgPath
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {technology.imgPath ? 'Définie' : 'Aucune'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Lien origine :</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          technology.lienOrigin
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {technology.lienOrigin ? 'Défini' : 'Aucun'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Description :</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          technology.description
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {technology.description ? 'Définie' : 'Aucune'}
                      </span>
                    </div>

                    <hr />

                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Ajoutée : {formatDate(technology.createdAt.toString())}</div>
                      {technology.updatedAt && (
                        <div>Modifié : {formatDate(technology.updatedAt.toString())}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Avertissement si utilisé dans des projets */}
              {technology.projects && technology.projects.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 mb-1">Attention</h4>
                      <p className="text-sm text-amber-700">
                        Cette technologie est utilisée dans {technology.projects.length} projet
                        {technology.projects.length > 1 ? 's' : ''}. La supprimer nécessitera de la
                        retirer de ces projets au préalable.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Aperçu public */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Aperçu public</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      {/* Mini preview comme dans le portfolio */}
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                        {technology.imgPathPublicUrl ? (
                          <img
                            src={technology.imgPathPublicUrl}
                            alt={technology.name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <Code2 className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="p-2">
                        <h4 className="font-medium text-gray-900 text-sm">{technology.name}</h4>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Aperçu de l'affichage dans votre portfolio
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

TechnologiesShow.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Technologies|show"
    description="Details de la technologie"
    currentPath="/admin/technologies"
  >
    {page}
  </AdminLayout>
)
