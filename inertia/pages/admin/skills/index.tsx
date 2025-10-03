import { Link, router } from '@inertiajs/react'
import React, { useState, useMemo, useEffect } from 'react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'
import SafeHTML from '~/components/safeHTML'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Image,
  Grid3X3,
  List,
  Calendar,
  CheckCircle,
  XCircle,
  Filter,
  SortAsc,
  SortDesc,
  X,
} from 'lucide-react'
import { SkillIndexProps } from '~/types/skills'

export default function SkillsIndex({ skills, categories }: SkillIndexProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'category'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isClient, setIsClient] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // États pour le modal de suppression
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    skillId: null as number | null,
    skillName: '',
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

  // Filtrage et tri des skills côté client
  const filteredAndSortedSkills = useMemo(() => {
    let filtered = skills.data.filter((skill) => {
      const matchesSearch =
        !searchTerm ||
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (skill.description && skill.description.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = !selectedCategory || skill.category === selectedCategory

      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === 'active' && skill.isActive) ||
        (selectedStatus === 'inactive' && !skill.isActive)

      return matchesSearch && matchesCategory && matchesStatus
    })

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
  }, [skills, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder])

  const handleReset = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedStatus('')
    setSortBy('name')
    setSortOrder('desc')
  }

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      skillId: id,
      skillName: name,
      isLoading: false,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.skillId) return

    setDeleteModal((prev) => ({ ...prev, isLoading: true }))

    try {
      router.delete(`/admin/skills/${deleteModal.skillId}`, {
        onSuccess: () => {
          setDeleteModal({
            isOpen: false,
            skillId: null,
            skillName: '',
            isLoading: false,
          })
        },
        preserveScroll: true,
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
      skillId: null,
      skillName: '',
      isLoading: false,
    })
  }

  // Active filters count
  const activeFiltersCount = [searchTerm, selectedCategory, selectedStatus].filter(Boolean).length

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Skills</h1>
              <p className="mt-1 text-gray-600">Gérez vos skills et domaines d'expertise</p>
              <div className="mt-1 text-sm text-gray-500">
                {filteredAndSortedSkills.length} skill
                {filteredAndSortedSkills.length > 1 ? 's' : ''} sur {skills.data.length} au total
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
              <Link href={'/admin/skills/create'}>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Nouvelle compétence
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
                      placeholder="Nom ou description..."
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

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Tous</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
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
                    onClick={handleReset}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAndSortedSkills.map((skill) => (
                <Card
                  key={skill.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 rounded-xl"
                >
                  {/* Image */}
                  <div className="aspect-video bg-gray-100 relative flex items-center justify-center">
                    {skill.imagePathPublicUrl ? (
                      <img
                        src={skill.imagePathPublicUrl}
                        alt={skill.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Image className="h-12 w-12 text-gray-400" />
                      </div>
                    )}

                    {/* Statut */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          skill.isActive
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        {skill.isActive ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {skill.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {skill.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                            {skill.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {skill.description && (
                      <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                        <SafeHTML html={skill.description} />
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(skill.createdAt.toString())}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/skills/${skill.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full border-gray-300">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                      </Link>
                      <Link href={`/admin/skills/${skill.id}/edit`}>
                        <Button size="sm" variant="outline" className="border-gray-300">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(skill.id, skill.name)}
                        className="text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50"
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
              {filteredAndSortedSkills.map((skill) => (
                <Card
                  key={skill.id}
                  className="overflow-hidden hover:shadow-md transition-all duration-300 bg-white border border-gray-200 rounded-xl"
                >
                  <div className="p-4 sm:p-6">
                    {/* Version mobile */}
                    <div className="sm:hidden">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 relative">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {skill.imagePathPublicUrl ? (
                              <img
                                src={skill.imagePathPublicUrl}
                                alt={skill.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Image className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                            {skill.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2 text-xs">
                            <span className="text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                              {skill.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                skill.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {skill.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {skill.description && (
                        <SafeHTML
                          as={'p'}
                          className="text-sm text-gray-600 mb-3 line-clamp-2"
                          html={skill.description}
                        />
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Créé le {formatDate(skill.createdAt.toString())}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/admin/skills/${skill.id}`} className="flex-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-gray-300 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                        </Link>
                        <Link href={`/admin/skills/${skill.id}/edit`}>
                          <Button size="sm" variant="outline" className="border-gray-300 px-2">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(skill.id, skill.name)}
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
                            {skill.imagePathPublicUrl ? (
                              <img
                                src={skill.imagePathPublicUrl}
                                alt={skill.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Image className="h-12 w-12 text-gray-400" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {skill.name}
                                </h3>
                                <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded">
                                  {skill.category}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                    skill.isActive
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {skill.isActive ? 'Actif' : 'Inactif'}
                                </span>
                              </div>

                              {skill.description && (
                                <SafeHTML
                                  as={'p'}
                                  className="text-gray-600 mb-3 line-clamp-2"
                                  html={skill.description}
                                />
                              )}

                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                Créé le {formatDate(skill.createdAt.toString())}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Link href={`/admin/skills/${skill.id}`}>
                                <Button size="sm" variant="outline" className="border-gray-300">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Voir
                                </Button>
                              </Link>
                              <Link href={`/admin/skills/${skill.id}/edit`}>
                                <Button size="sm" variant="outline" className="border-gray-300">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Modifier
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteClick(skill.id, skill.name)}
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

          {/* Empty State */}
          {filteredAndSortedSkills.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchTerm || selectedCategory || selectedStatus
                  ? 'Aucun skill trouvé'
                  : 'Aucun skill'}
              </h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || selectedCategory || selectedStatus
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par créer votre premier skill.'}
              </p>
              <div className="mt-6">
                {searchTerm || selectedCategory || selectedStatus ? (
                  <Button onClick={handleReset} variant="outline" className="border-gray-300">
                    Réinitialiser les filtres
                  </Button>
                ) : (
                  <Link href={'/admin/skills/create'}>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 mx-auto">
                      <Plus className="h-4 w-4" />
                      Nouvelle compétence
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
        title="Supprimer le skill"
        message="Êtes-vous sûr de vouloir supprimer cette compétence ?"
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.skillName}
        isLoading={deleteModal.isLoading}
      />
    </>
  )
}

SkillsIndex.layout = (page: React.ReactNode) => (
  <AdminLayout description="Gérer les compétences" currentPath="/admin/skills">
    {page}
  </AdminLayout>
)
