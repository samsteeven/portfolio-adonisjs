import React, { useState, useMemo } from 'react'
import { Link, router } from '@inertiajs/react'
import { Search, Plus, Eye, Edit3, Trash2, Grid3X3, List, ExternalLink, Code2 } from 'lucide-react'
import AdminLayout from '~/layout/AdminLayout'
import { Technology, TechnologyFilters } from '~/types/technology'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'

type TechnologyIndex = {
  technologies: {
    data: Array<Technology>
    meta: {
      total: number
      lastPage: number
      currentPage: number
      perPage: number
      firstPage: number
      lastPageUrl: string
      nextPageUrl: string | null
      previousPageUrl: string | null
    }
  }
  categories: string[]
  filters: TechnologyFilters
}

export default function TechnologiesIndex({ technologies, categories, filters }: TechnologyIndex) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [technologyToDelete, setTechnologyToDelete] = useState<Technology | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState(filters?.search || '')
  const [selectedCategory, setSelectedCategory] = useState(filters?.category || '')
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Filtrage côté client
  const filteredTechnologies = useMemo(() => {
    let filtered = technologies.data

    // Filtre par terme de recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(
        (tech) =>
          tech.name.toLowerCase().includes(searchLower) ||
          tech.description?.toLowerCase().includes(searchLower) ||
          tech.category.toLowerCase().includes(searchLower)
      )
    }

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter((tech) => tech.category === selectedCategory)
    }

    return filtered
  }, [technologies.data, searchTerm, selectedCategory])

  // Pagination côté client
  const paginatedTechnologies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredTechnologies.slice(startIndex, endIndex)
  }, [filteredTechnologies, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredTechnologies.length / itemsPerPage)

  // Réinitialiser à la page 1 quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setCurrentPage(1)
  }

  const openDeleteModal = (technology: Technology) => {
    setTechnologyToDelete(technology)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setTechnologyToDelete(null)
    setIsDeleting(false)
  }

  const handleDelete = () => {
    if (!technologyToDelete) return

    setIsDeleting(true)
    router.delete(`/admin/technologies/${technologyToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        closeDeleteModal()
      },
      onError: () => {
        setIsDeleting(false)
      },
    })
  }

  const TechnologyCard = ({ technology }: { technology: Technology }) => (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
        {technology.imgPathPublicUrl ? (
          <img
            src={technology.imgPathPublicUrl}
            alt={technology.name}
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <Code2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
        )}

        {/* Badge de catégorie */}
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium max-w-[calc(100%-16px)] truncate">
          {technology.category}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base truncate pr-2">
            {technology.name}
          </h3>
          {technology.lienOrigin && (
            <a
              href={technology.lienOrigin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {technology.description && (
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
            {technology.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 truncate pr-2">
            Ajouté le {new Date(technology.createdAt).toLocaleDateString('fr-FR')}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Link
              href={`/admin/technologies/${technology.id}`}
              className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
            <Link
              href={`/admin/technologies/${technology.id}/edit`}
              className="p-1 sm:p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
            >
              <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
            <button
              onClick={() => openDeleteModal(technology)}
              className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const TechnologyRow = ({ technology }: { technology: Technology }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
            {technology.imgPathPublicUrl ? (
              <img
                src={technology.imgPathPublicUrl}
                alt={technology.name}
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
            ) : (
              <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {technology.name}
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                {technology.category}
              </span>
              {technology.lienOrigin && (
                <a
                  href={technology.lienOrigin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 flex-shrink-0 hidden sm:block"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {technology.description && (
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2">
                {technology.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {technology.lienOrigin && (
            <a
              href={technology.lienOrigin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all sm:hidden"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <Link
            href={`/admin/technologies/${technology.id}`}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={`/admin/technologies/${technology.id}/edit`}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
          <button
            onClick={() => openDeleteModal(technology)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:h-16 gap-4 sm:gap-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Technologies</h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Gérez les technologies de votre portfolio
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={'/admin/technologies/create'}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Ajouter une technologie</span>
                  <span className="sm:hidden">Ajouter</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Barre de recherche et filtres */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-4">
                {/* Recherche */}
                <div className="w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      placeholder="Rechercher une technologie..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Filtre par catégorie */}
                  <div className="flex-1">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">Toutes les catégories</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {(searchTerm || selectedCategory) && (
                      <button
                        onClick={clearFilters}
                        className="flex-1 sm:flex-none px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
                      >
                        Effacer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle vue et résultats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div className="text-gray-600 text-sm sm:text-base">
              {filteredTechnologies.length} technologie{filteredTechnologies.length > 1 ? 's' : ''}{' '}
              trouvée
              {filteredTechnologies.length > 1 ? 's' : ''}
              {filteredTechnologies.length !== technologies.data.length && (
                <span className="text-gray-400"> sur {technologies.data.length}</span>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1 self-start sm:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Liste des technologies */}
          {paginatedTechnologies.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {paginatedTechnologies.map((technology) => (
                  <TechnologyCard key={technology.id} technology={technology} />
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {paginatedTechnologies.map((technology) => (
                  <TechnologyRow key={technology.id} technology={technology} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-8 sm:py-12">
              <Code2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Aucune technologie trouvée
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                {searchTerm || selectedCategory
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Commencez par ajouter votre première technologie'}
              </p>
              {!searchTerm && !selectedCategory && (
                <Link
                  href={'/admin/technologies/create'}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Ajouter une technologie
                </Link>
              )}
            </div>
          )}

          {/* Pagination côté client */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8">
              {/* Bouton précédent */}
              {currentPage > 1 && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 rounded transition-colors text-sm sm:text-base text-gray-600 hover:bg-gray-100"
                >
                  ‹ Précédent
                </button>
              )}

              {/* Numéros de pages */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Afficher toujours la première page, la dernière page, la page courante et 2 pages avant/après
                const showPage =
                  page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2

                if (!showPage) {
                  // Afficher "..." si nécessaire
                  if (page === 2 && currentPage > 4) {
                    return (
                      <span key="dots1" className="px-2 py-1.5 text-gray-400">
                        ...
                      </span>
                    )
                  }
                  if (page === totalPages - 1 && currentPage < totalPages - 3) {
                    return (
                      <span key="dots2" className="px-2 py-1.5 text-gray-400">
                        ...
                      </span>
                    )
                  }
                  return null
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded transition-colors text-sm sm:text-base ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}

              {/* Bouton suivant */}
              {currentPage < totalPages && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 rounded transition-colors text-sm sm:text-base text-gray-600 hover:bg-gray-100"
                >
                  Suivant ›
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de suppression */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Supprimer la technologie"
        message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette technologie ?"
        itemName={technologyToDelete?.name}
        isLoading={isDeleting}
      />
    </>
  )
}

TechnologiesIndex.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Technologies"
    description="Gerer mes technologies"
    currentPath="/admin/technologies"
  >
    {page}
  </AdminLayout>
)
