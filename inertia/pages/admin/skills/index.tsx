import { Link, router } from '@inertiajs/react'
import React, { useState, useMemo, useEffect } from 'react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Image,
  Grid3X3,
  List,
  Tag,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { SkillType } from '~/types/skills'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'

interface Props {
  skills: {
    data: SkillType[]
  }
  categories: string[]
}

export default function SkillsIndex({ skills, categories }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'category'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isClient, setIsClient] = useState(false)

  // États pour le modal de suppression
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    skillId: null as number | null,
    skillName: '',
    isLoading: false,
  })

  // Résoudre l'hydratation en s'assurant que le rendu côté client soit identique
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fonction pour formater les dates de manière consistante
  const formatDate = (dateString: string) => {
    if (!isClient) {
      // Côté serveur, on retourne une chaîne vide ou une valeur par défaut
      return '...'
    }
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  // Filtrage et tri des données côté client
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
      // Utiliser Inertia pour la suppression
      router.delete(`/admin/skills/${deleteModal.skillId}`, {
        onSuccess: () => {
          setDeleteModal({
            isOpen: false,
            skillId: null,
            skillName: '',
            isLoading: false,
          })
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
      skillId: null,
      skillName: '',
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
              <h1 className="text-3xl font-bold text-gray-900">Skills</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-700">
                Gérez vos skills et domaines d'expertise
              </p>
              <div className="mt-2 text-sm text-gray-500">
                {filteredAndSortedSkills.length} skill(s) sur {skills.data.length} au total
              </div>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Link href={'/admin/skills/create'}>
                <Button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Nouvelle compétence
                </Button>
              </Link>
            </div>
          </div>

          {/* Filtres et contrôles */}
          <Card className="mb-8 p-6 bg-white">
            <div className="grid grid-cols-1 gap-6">
              {/* Ligne 1: Recherche et filtres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Recherche */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-none"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
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

                {/* Actions */}
                <div className="flex items-end gap-2">
                  <Button variant="ghost" onClick={handleReset} className="flex-1 border-none">
                    Réinitialiser
                  </Button>
                </div>
              </div>

              {/* Ligne 2: Affichage */}
              <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAndSortedSkills.map((skill) => (
                <Card
                  key={skill.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow bg-white"
                >
                  {/* Image */}
                  <div className="aspect-video bg-gray-100 relative">
                    {skill.imagePathPublicUrl ? (
                      <img
                        src={skill.imagePathPublicUrl}
                        alt={skill.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Image className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
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
                        <div className="flex items-center gap-1 mt-1">
                          <Tag className="h-3 w-3 text-blue-500" />
                          <p className="text-sm text-blue-600 font-medium">{skill.category}</p>
                        </div>
                      </div>
                    </div>

                    {skill.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{skill.description}</p>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(skill.createdAt.toString())}
                      </div>
                      {skill.updatedAt && (
                        <div>Modifié le {formatDate(skill.updatedAt.toString())}</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/skills/${skill.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full border-none">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                      </Link>
                      <Link href={`/admin/skills/${skill.id}/edit`}>
                        <Button size="sm" variant="outline" className="border-none">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(skill.id, skill.name)}
                        className="text-red-600 hover:text-red-800 border-none hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Vue liste - Améliorée pour les petits écrans */
            <div className="space-y-4">
              {filteredAndSortedSkills.map((skill) => (
                <Card
                  key={skill.id}
                  className="overflow-hidden hover:shadow-md transition-shadow bg-white"
                >
                  <div className="p-4 sm:p-6">
                    {/* Version mobile (écrans < 640px) */}
                    <div className="sm:hidden">
                      <div className="flex items-start gap-3 mb-3">
                        {/* Image miniature */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                            {skill.imagePathPublicUrl ? (
                              <img
                                src={skill.imagePathPublicUrl}
                                alt={skill.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Image className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Info principale */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                            {skill.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Tag className="h-3 w-3 text-blue-500" />
                            <span className="text-sm text-blue-600 font-medium">
                              {skill.category}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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

                      {/* Description */}
                      {skill.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {skill.description}
                        </p>
                      )}

                      {/* Meta info mobile */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Créé le {formatDate(skill.createdAt.toString())}
                        </div>
                        {skill.updatedAt && (
                          <div>Modifié le {formatDate(skill.updatedAt.toString())}</div>
                        )}
                      </div>

                      {/* Actions mobile */}
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/skills/${skill.id}`} className="flex-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-none text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                        </Link>
                        <Link href={`/admin/skills/${skill.id}/edit`}>
                          <Button size="sm" variant="outline" className="border-none px-2">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(skill.id, skill.name)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 border-none px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Version desktop (écrans >= 640px) */}
                    <div className="hidden sm:block">
                      <div className="flex items-center gap-6">
                        {/* Image miniature */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            {skill.imagePathPublicUrl ? (
                              <img
                                src={skill.imagePathPublicUrl}
                                alt={skill.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Image className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Contenu principal */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Tag className="h-3 w-3 text-blue-500" />
                                <span className="text-sm text-blue-600 font-medium">
                                  {skill.category}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    skill.isActive
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {skill.isActive ? 'Actif' : 'Inactif'}
                                </span>
                              </div>
                              {skill.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                                  {skill.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Créé le {formatDate(skill.createdAt.toString())}
                                </div>
                                {skill.updatedAt && (
                                  <div>Modifié le {formatDate(skill.updatedAt.toString())}</div>
                                )}
                              </div>
                            </div>

                            {/* Actions desktop */}
                            <div className="flex items-center gap-2 ml-4">
                              <Link href={`/admin/skills/${skill.id}`}>
                                <Button size="sm" variant="outline" className="border-none">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Voir
                                </Button>
                              </Link>
                              <Link href={`/admin/skills/${skill.id}/edit`}>
                                <Button size="sm" variant="outline" className="border-none">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Modifier
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteClick(skill.id, skill.name)}
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
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredAndSortedSkills.length === 0 && (
            <div className="text-center py-12">
              <Image className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {searchTerm || selectedCategory || selectedStatus
                  ? 'Aucune compétence trouvée'
                  : 'Aucune compétence'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCategory || selectedStatus
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par créer votre première compétence.'}
              </p>
              <div className="mt-6">
                {searchTerm || selectedCategory || selectedStatus ? (
                  <Button onClick={handleReset} variant="outline">
                    Réinitialiser les filtres
                  </Button>
                ) : (
                  <Link href={'/admin/skills/create'}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
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
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le skill"
        message="Êtes-vous sûr de vouloir supprimer cette compétence ?"
        itemName={deleteModal.skillName}
        isLoading={deleteModal.isLoading}
      />
    </>
  )
}

SkillsIndex.layout = (page: React.ReactNode) => (
  <AdminLayout title="Skills" description="Mes skills" currentPath="/admin/skills">
    {page}
  </AdminLayout>
)
