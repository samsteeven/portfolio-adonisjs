import { Link, router } from '@inertiajs/react'
import React, { useState, useMemo, useEffect } from 'react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Images,
  Grid3X3,
  List,
  Tag,
  Calendar,
  CheckCircle,
  XCircle,
  ExternalLink,
  Github,
  Filter,
  SortAsc,
  SortDesc,
  User,
} from 'lucide-react'
import { ProjectsIndexProps } from '~/types/projets'
import { toast } from 'sonner'
import { getProjectMainImage } from '~/utils/others'

export default function ProjectsIndex({
  projects,
  technologies,
  years = [],
  filters,
}: ProjectsIndexProps) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '')
  const [selectedTechnology, setSelectedTechnology] = useState(filters?.technology || '')
  const [selectedYear, setSelectedYear] = useState(filters?.year || '')
  const [selectedStatus, setSelectedStatus] = useState(filters?.isActive || '')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt' | 'year'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isClient, setIsClient] = useState(false)

  // États pour le modal de suppression
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    projectId: null as number | null,
    projectTitle: '',
    isLoading: false,
  })

  // Résoudre l'hydratation
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    if (!isClient) return '...'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  // Filtrage et tri des projets côté client
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.data.filter((project) => {
      const matchesSearch =
        !searchTerm ||
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description &&
          project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.role && project.role.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesTechnology =
        !selectedTechnology ||
        project.technologies?.some((tech) => tech.id.toString() === selectedTechnology)

      const matchesYear = !selectedYear || project.year === selectedYear

      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === 'active' && project.isActive) ||
        (selectedStatus === 'inactive' && !project.isActive)

      return matchesSearch && matchesTechnology && matchesYear && matchesStatus
    })

    // Tri
    filtered.sort((a, b) => {
      let aValue: string | Date | number
      let bValue: string | Date | number

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'year':
          aValue = parseInt(a.year || '0')
          bValue = parseInt(b.year || '0')
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'updatedAt':
          aValue = new Date(a.updatedAt || a.createdAt)
          bValue = new Date(b.updatedAt || b.createdAt)
          break
        default:
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      return sortOrder === 'asc'
        ? (aValue as Date).getTime() - (bValue as Date).getTime()
        : (bValue as Date).getTime() - (aValue as Date).getTime()
    })

    return filtered
  }, [projects, searchTerm, selectedTechnology, selectedYear, selectedStatus, sortBy, sortOrder])

  const handleReset = () => {
    setSearchTerm('')
    setSelectedTechnology('')
    setSelectedYear('')
    setSelectedStatus('')
    setSortBy('createdAt')
    setSortOrder('desc')
  }

  const handleDeleteClick = (id: number, title: string) => {
    setDeleteModal({
      isOpen: true,
      projectId: id,
      projectTitle: title,
      isLoading: false,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.projectId) return

    setDeleteModal((prev) => ({ ...prev, isLoading: true }))

    try {
      router.delete(`/admin/projects/${deleteModal.projectId}`, {
        onSuccess: () => {
          toast.success('Projet supprimé avec succès')
          setDeleteModal({
            isOpen: false,
            projectId: null,
            projectTitle: '',
            isLoading: false,
          })
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
      projectId: null,
      projectTitle: '',
      isLoading: false,
    })
  }

  return (
    <>
      <div className="min-h-screen sm:bg-gray-50 sm:p-3">
        <div className="px-3 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="sm:flex sm:items-center justify-between mb-8">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold text-gray-900">Projets</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-700">
                Gérez vos projets de portfolio
              </p>
              <div className="mt-2 text-sm text-gray-500">
                {filteredAndSortedProjects.length} projet(s) sur {projects.data.length} au total
              </div>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Link href={'/admin/projects/create'}>
                <Button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Nouveau projet
                </Button>
              </Link>
            </div>
          </div>

          {/* Filtres et contrôles */}
          <Card className="mb-8 p-6 bg-white">
            <div className="grid grid-cols-1 gap-6">
              {/* Ligne 1: Recherche et filtres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Recherche */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Titre, description, rôle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Technologie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technologie
                  </label>
                  <select
                    value={selectedTechnology}
                    onChange={(e) => setSelectedTechnology(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-none"
                  >
                    <option value="">Toutes les technologies</option>
                    {technologies.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Année */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-none"
                  >
                    <option value="">Toutes les années</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-none"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>

                {/* Tri */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tri</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-none"
                    >
                      <option value="createdAt">Date création</option>
                      <option value="updatedAt">Date modification</option>
                      <option value="year">Année projet</option>
                      <option value="title">Titre</option>
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
              </div>

              {/* Ligne 2: Actions et vue */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Actions de filtres */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="border-none text-sm"
                    size="sm"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    Réinitialiser
                  </Button>
                </div>

                {/* Mode d'affichage */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                    title="Vue grille"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                    title="Vue liste"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Contenu */}
          {viewMode === 'grid' ? (
            /* Vue grille */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedProjects.map((project) => {
                const mainImage = getProjectMainImage(project)
                const imageCount = project.images?.length || 0

                return (
                  <Card
                    key={project.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow bg-white"
                  >
                    {/* Image */}
                    <div className="aspect-video bg-gray-100 relative">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={project.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Images className="h-12 w-12 text-gray-400" />
                        </div>
                      )}

                      {/* Badge pour nombre d'images */}
                      {imageCount > 1 && (
                        <div className="absolute top-2 left-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 border">
                            <Images className="h-3 w-3 mr-1" />
                            {imageCount}
                          </span>
                        </div>
                      )}

                      {/* Statut */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            project.isActive
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                        >
                          {project.isActive ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {project.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>

                      {/* Liens rapides */}
                      {(project.demoPath || project.githubPath) && (
                        <div className="absolute bottom-2 left-2 flex gap-2">
                          {project.demoPath && (
                            <a
                              href={project.demoPath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                              title="Voir la démo"
                            >
                              <ExternalLink className="h-3 w-3 text-gray-700" />
                            </a>
                          )}
                          {project.githubPath && (
                            <a
                              href={project.githubPath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                              title="Voir le code"
                            >
                              <Github className="h-3 w-3 text-gray-700" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-blue-600 font-medium">
                              {project.year}
                            </span>
                            {project.role && (
                              <span className="text-xs text-gray-500 truncate">{project.role}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {project.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {/* Technologies */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <span
                              key={tech.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                            >
                              <Tag className="h-2 w-2 mr-1" />
                              {tech.name}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Meta info */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(project.createdAt.toString())}
                        </div>
                        {project.updatedAt && (
                          <div>Modifié le {formatDate(project.updatedAt.toString())}</div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/projects/${project.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full border-none">
                            <Eye className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                        </Link>
                        <Link href={`/admin/projects/${project.id}/edit`}>
                          <Button size="sm" variant="outline" className="border-none">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(project.id, project.title)}
                          className="text-red-600 hover:text-red-800 border-none hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            /* Vue liste */
            <div className="space-y-4">
              {filteredAndSortedProjects.map((project) => {
                const mainImage = getProjectMainImage(project)
                const imageCount = project.images?.length || 0

                return (
                  <Card
                    key={project.id}
                    className="overflow-hidden hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="p-4 sm:p-6">
                      {/* Version mobile */}
                      <div className="sm:hidden">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0 relative">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                              {mainImage ? (
                                <img
                                  src={mainImage}
                                  alt={project.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Images className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                            {imageCount > 1 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {imageCount}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                              {project.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-2 text-xs">
                              <span className="text-blue-600 font-medium">{project.year}</span>
                              {project.role && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-600 truncate">{project.role}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  project.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {project.isActive ? 'Actif' : 'Inactif'}
                              </span>
                              {project.technologies && project.technologies.length > 0 && (
                                <span className="text-xs text-gray-500">
                                  {project.technologies.length} tech.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {project.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Créé le {formatDate(project.createdAt.toString())}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/admin/projects/${project.id}`} className="flex-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-none text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Voir
                            </Button>
                          </Link>
                          <Link href={`/admin/projects/${project.id}/edit`}>
                            <Button size="sm" variant="outline" className="border-none px-2">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(project.id, project.title)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 border-none px-2"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Version desktop */}
                      <div className="hidden sm:block">
                        <div className="flex items-center gap-6">
                          <div className="flex-shrink-0 relative">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                              {mainImage ? (
                                <img
                                  src={mainImage}
                                  alt={project.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Images className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            {imageCount > 1 && (
                              <span className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {imageCount}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {project.title}
                                  </h3>
                                  <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                                    {project.year}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      project.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {project.isActive ? 'Actif' : 'Inactif'}
                                  </span>

                                  {/* Liens externes */}
                                  <div className="flex gap-2">
                                    {project.demoPath && (
                                      <a
                                        href={project.demoPath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Voir la démo"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    )}
                                    {project.githubPath && (
                                      <a
                                        href={project.githubPath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 hover:text-gray-800"
                                        title="Voir le code"
                                      >
                                        <Github className="h-4 w-4" />
                                      </a>
                                    )}
                                  </div>
                                </div>

                                {project.role && (
                                  <div className="flex items-center gap-1 mb-2">
                                    <User className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm text-gray-600">{project.role}</span>
                                  </div>
                                )}

                                {project.description && (
                                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                    {project.description}
                                  </p>
                                )}

                                {project.technologies && project.technologies.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {project.technologies.slice(0, 5).map((tech) => (
                                      <span
                                        key={tech.id}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                      >
                                        {tech.name}
                                      </span>
                                    ))}
                                    {project.technologies.length > 5 && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                        +{project.technologies.length - 5}
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Créé le {formatDate(project.createdAt.toString())}
                                  </div>
                                  {project.updatedAt && (
                                    <div>Modifié le {formatDate(project.updatedAt.toString())}</div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <Link href={`/admin/projects/${project.id}`}>
                                  <Button size="sm" variant="outline" className="border-none">
                                    <Eye className="h-3 w-3 mr-1" />
                                    Voir
                                  </Button>
                                </Link>
                                <Link href={`/admin/projects/${project.id}/edit`}>
                                  <Button size="sm" variant="outline" className="border-none">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Modifier
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteClick(project.id, project.title)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 border-none"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {filteredAndSortedProjects.length === 0 && (
            <div className="text-center py-12">
              <Images className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {searchTerm || selectedTechnology || selectedYear || selectedStatus
                  ? 'Aucun projet trouvé'
                  : 'Aucun projet'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedTechnology || selectedYear || selectedStatus
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par créer votre premier projet.'}
              </p>
              <div className="mt-6">
                {searchTerm || selectedTechnology || selectedYear || selectedStatus ? (
                  <Button onClick={handleReset} variant="outline">
                    Réinitialiser les filtres
                  </Button>
                ) : (
                  <Link href={'/admin/projects/create'}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau projet
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le projet"
        message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce projet et toutes ses images ?"
        itemName={deleteModal.projectTitle}
        isLoading={deleteModal.isLoading}
      />
    </>
  )
}

ProjectsIndex.layout = (page: React.ReactNode) => (
  <AdminLayout title="Projets" description="Mes projets" currentPath="/admin/projects">
    {page}
  </AdminLayout>
)
