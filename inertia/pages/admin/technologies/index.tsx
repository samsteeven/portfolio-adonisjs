import React, { useState, useMemo, useEffect } from 'react'
import { Link, router } from '@inertiajs/react'
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Grid3X3,
  List,
  ExternalLink,
  Code2,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Calendar,
} from 'lucide-react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import ConfirmationModal from '~/components/ConfirmationModal'
import SafeHTML from '~/components/safeHTML'
import { Technology, TechnologyFilters } from '~/types/technology'
import { formatLocalDate } from '~/utils/utils_string'

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'category'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isClient, setIsClient] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Résoudre l'hydratation
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Filtrage côté client
  const filteredTechnologies = useMemo(() => {
    let filtered = technologies.data

    // Filtre par terme de recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(
        (tech) =>
          tech.name.toLowerCase().includes(searchLower) ||
          (tech.description && tech.description.toLowerCase().includes(searchLower)) ||
          tech.category.toLowerCase().includes(searchLower)
      )
    }

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter((tech) => tech.category === selectedCategory)
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'category':
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue as string)
        : (bValue as string).localeCompare(aValue)
    })

    return filtered
  }, [technologies.data, searchTerm, selectedCategory, sortBy, sortOrder])

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
    setSortBy('name')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  // Active filters count
  const activeFiltersCount = [searchTerm, selectedCategory].filter(Boolean).length

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

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Technologies</h1>
              <p className="mt-1 text-gray-600">Gérez les technologies de mon portfolio</p>
              <div className="mt-1 text-sm text-gray-500">
                {filteredTechnologies.length} technologie
                {filteredTechnologies.length > 1 ? 's' : ''} sur {technologies.data.length} au total
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtres{' '}
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              <Link href={'/admin/technologies/create'}>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Ajouter une technologie
                </Button>
              </Link>
            </div>
          </div>

          {/* Filtres et contrôles */}
          <Card
            className={`mb-6 p-4 sm:p-6 bg-white transition-all duration-300 ${showFilters ? 'block' : 'hidden md:block'}`}
          >
            <div className="space-y-4">
              {/* Mobile filter header */}
              <div className="flex md:hidden items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Filtres</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="p-1"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Ligne 1: Recherche et filtres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Recherche */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Nom, catégorie ou description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Toutes</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ligne 2: Tri et actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Tri */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tri</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="name">Nom</option>
                      <option value="category">Catégorie</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions de filtres */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="w-full border border-gray-300 text-sm"
                    size="sm"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    Réinitialiser
                  </Button>
                </div>

                {/* Mode d'affichage */}
                <div className="flex items-end">
                  <div className="flex w-full bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 py-2 rounded text-sm font-medium ${
                        viewMode === 'grid'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Vue grille"
                    >
                      <Grid3X3 className="h-4 w-4 mx-auto" />
                      <span className="sr-only">Grille</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 py-2 rounded text-sm font-medium ${
                        viewMode === 'list'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Vue liste"
                    >
                      <List className="h-4 w-4 mx-auto" />
                      <span className="sr-only">Liste</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Contenu */}
          {viewMode === 'grid' ? (
            /* Vue grille */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedTechnologies.map((technology) => (
                <Card
                  key={technology.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 rounded-xl flex flex-col"
                >
                  {/* Image - Hauteur réduite */}
                  <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 relative flex items-center justify-center p-4">
                    {technology.imgPathPublicUrl ? (
                      <img
                        src={technology.imgPathPublicUrl}
                        alt={technology.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Code2 className="h-10 w-10 text-gray-400" />
                    )}

                    {/* Lien externe - En haut à droite */}
                    {technology.lienOrigin && (
                      <a
                        href={technology.lienOrigin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 p-1.5 bg-white/95 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm border border-gray-200"
                        title="Voir le site officiel"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-gray-700" />
                      </a>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate flex-1">
                        {technology.name}
                      </h3>
                    </div>

                    <div className="mb-3">
                      <span className="inline-block text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                        {technology.category}
                      </span>
                    </div>

                    {technology.description && (
                      <div className="text-xs text-gray-600 mb-3 line-clamp-2 flex-1">
                        <SafeHTML html={technology.description} />
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center text-xs text-gray-500 mb-3 pt-2 border-t border-gray-100">
                      <Calendar className="h-3 w-3 mr-1" />
                      {isClient ? formatLocalDate(technology.createdAt.toString()) : '...'}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-auto">
                      <Link href={`/admin/technologies/${technology.id}`} className="flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-gray-300 text-xs h-8"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                      </Link>
                      <Link href={`/admin/technologies/${technology.id}/edit`}>
                        <Button size="sm" variant="outline" className="border-gray-300 h-8 px-2">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteModal(technology)}
                        className="text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50 h-8 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Vue liste */
            <div className="space-y-4">
              {paginatedTechnologies.map((technology) => (
                <Card
                  key={technology.id}
                  className="overflow-hidden hover:shadow-md transition-all duration-300 bg-white border border-gray-200 rounded-xl"
                >
                  <div className="p-4 sm:p-6">
                    {/* Version mobile */}
                    <div className="sm:hidden">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 relative">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {technology.imgPathPublicUrl ? (
                              <img
                                src={technology.imgPathPublicUrl}
                                alt={technology.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Code2 className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                            {technology.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2 text-xs">
                            <span className="text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                              {technology.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {technology.description && (
                        <SafeHTML
                          as={'p'}
                          className="text-sm text-gray-600 mb-3 line-clamp-2"
                          html={technology.description}
                        />
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Créé le{' '}
                          {isClient ? formatLocalDate(technology.createdAt.toString()) : '..'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/admin/technologies/${technology.id}`} className="flex-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-gray-300 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                        </Link>
                        <Link href={`/admin/technologies/${technology.id}/edit`}>
                          <Button size="sm" variant="outline" className="border-gray-300 px-2">
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteModal(technology)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-300 px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Version desktop */}
                    <div className="hidden sm:block">
                      <div className="flex items-center gap-6">
                        <div className="flex-shrink-0 relative">
                          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {technology.imgPathPublicUrl ? (
                              <img
                                src={technology.imgPathPublicUrl}
                                alt={technology.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Code2 className="h-12 w-12 text-gray-400" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {technology.name}
                                </h3>
                                <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded">
                                  {technology.category}
                                </span>

                                {/* Lien externe */}
                                {technology.lienOrigin && (
                                  <a
                                    href={technology.lienOrigin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Voir le site officiel"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                              </div>

                              {technology.description && (
                                <SafeHTML
                                  as={'p'}
                                  className="text-gray-600 mb-3 line-clamp-2"
                                  html={technology.description}
                                />
                              )}

                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                Créé le{' '}
                                {isClient
                                  ? formatLocalDate(technology.createdAt.toString())
                                  : '...'}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Link href={`/admin/technologies/${technology.id}`}>
                                <Button size="sm" variant="outline" className="border-gray-300">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Voir
                                </Button>
                              </Link>
                              <Link href={`/admin/technologies/${technology.id}/edit`}>
                                <Button size="sm" variant="outline" className="border-gray-300">
                                  <Edit3 className="h-4 w-4 mr-1" />
                                  Modifier
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openDeleteModal(technology)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Précédent
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum =
                      totalPages <= 5
                        ? i + 1
                        : currentPage <= 3
                          ? i + 1
                          : currentPage >= totalPages - 2
                            ? totalPages - 4 + i
                            : currentPage - 2 + i

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-full text-sm ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredTechnologies.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Code2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchTerm || selectedCategory
                  ? 'Aucune technologie trouvée'
                  : 'Aucune technologie'}
              </h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || selectedCategory
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par créer votre première technologie.'}
              </p>
              <div className="mt-6">
                {searchTerm || selectedCategory ? (
                  <Button onClick={clearFilters} variant="outline" className="border-gray-300">
                    Réinitialiser les filtres
                  </Button>
                ) : (
                  <Link href={'/admin/technologies/create'}>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 mx-auto">
                      <Plus className="h-4 w-4" />
                      Ajouter une technologie
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        title="Supprimer la technologie"
        message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette technologie ?"
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        itemName={technologyToDelete?.name || ''}
        isLoading={isDeleting}
      />
    </>
  )
}

TechnologiesIndex.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Technologies"
    description="Gérer les technologies"
    currentPath="/admin/technologies"
  >
    {page}
  </AdminLayout>
)
