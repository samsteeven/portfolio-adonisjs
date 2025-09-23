import React, { useState, useMemo } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Image as ImageIcon,
  ExternalLink,
  Filter,
  Grid,
  List,
  Star,
  DollarSign,
  X,
  SortAsc,
  SortDesc,
} from 'lucide-react'
import { ServiceType } from '~/types/services'
import { toast } from 'sonner'

interface Props {
  services: {
    data: ServiceType[]
    meta: {
      page: number
      lastPage: number
      total: number
      perPage: number
    }
  }
  filters: {
    search: string
    isActive: string
  }
  stats: {
    total: number
    active: number
    inactive: number
    withPrice: number
    withoutPrice: number
  }
}

type SortField = 'title' | 'displayOrder' | 'price' | 'isActive'
type SortDirection = 'asc' | 'desc'

export default function AdminServicesIndex({ services, stats }: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [sortField, setSortField] = useState<SortField>('displayOrder')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    serviceId: null as number | null,
    serviceName: '',
    isLoading: false,
  })

  // Filtrage et tri côté client
  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...services.data]

    // Recherche textuelle
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(searchLower) ||
          service.description.toLowerCase().includes(searchLower)
      )
    }

    // Filtre par statut
    if (statusFilter) {
      const isActive = statusFilter === 'true'
      filtered = filtered.filter((service) => service.isActive === isActive)
    }

    // Filtre par prix
    if (priceFilter) {
      if (priceFilter === 'with') {
        filtered = filtered.filter((service) => service.price && service.price > 0)
      } else if (priceFilter === 'without') {
        filtered = filtered.filter((service) => !service.price || service.price === 0)
      }
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'displayOrder':
          aValue = a.displayOrder
          bValue = b.displayOrder
          break
        case 'price':
          aValue = a.price || 0
          bValue = b.price || 0
          break
        case 'isActive':
          aValue = a.isActive ? 1 : 0
          bValue = b.isActive ? 1 : 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [services.data, searchTerm, statusFilter, priceFilter, sortField, sortDirection])

  // Pagination côté client
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedServices.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedServices, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedServices.length / itemsPerPage)

  const handleReset = () => {
    setSearchTerm('')
    setStatusFilter('')
    setPriceFilter('')
    setSortField('displayOrder')
    setSortDirection('asc')
    setCurrentPage(1)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const handleToggleStatus = (serviceId: number) => {
    router.patch(
      `/admin/services/${serviceId}/toggle-status`,
      {},
      {
        preserveScroll: true,
        onError: () => {
          toast.error('Erreur lors du changement de statut')
        },
      }
    )
  }

  const handleDuplicate = (serviceId: number) => {
    router.post(
      `/admin/services/${serviceId}/duplicate`,
      {},
      {
        onError: () => {
          toast.error('Erreur lors de la duplication')
        },
      }
    )
  }

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      serviceId: id,
      serviceName: name,
      isLoading: false,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.serviceId) return

    setDeleteModal((prev) => ({ ...prev, isLoading: true }))

    router.delete(`/admin/services/${deleteModal.serviceId}`, {
      onSuccess: () => {
        setDeleteModal({
          isOpen: false,
          serviceId: null,
          serviceName: '',
          isLoading: false,
        })
      },
      onError: () => {
        toast.error('Erreur lors de la suppression')
        setDeleteModal((prev) => ({ ...prev, isLoading: false }))
      },
    })
  }

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      serviceId: null,
      serviceName: '',
      isLoading: false,
    })
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className={`h-auto p-2 justify-start font-medium ${
        sortField === field ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
      {sortField === field &&
        (sortDirection === 'asc' ? (
          <SortAsc className="ml-1 h-4 w-4" />
        ) : (
          <SortDesc className="ml-1 h-4 w-4" />
        ))}
    </Button>
  )

  const ServiceCard = ({ service }: { service: ServiceType }) => (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 overflow-hidden">
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-white/30" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
              service.isActive ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                service.isActive ? 'bg-white' : 'bg-white'
              }`}
            />
            {service.isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => handleToggleStatus(service.id)}
            className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
            title={service.isActive ? 'Désactiver' : 'Activer'}
          >
            {service.isActive ? (
              <EyeOff className="h-4 w-4 text-gray-700" />
            ) : (
              <Eye className="h-4 w-4 text-gray-700" />
            )}
          </button>
        </div>

        {/* Order Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-mono bg-black/20 text-white backdrop-blur-sm">
            #{service.displayOrder}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {service.title}
          </h3>
          {service.price && service.price > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 ml-2 flex-shrink-0">
              <DollarSign className="h-3 w-3 mr-1" />
              {service.formattedPrice}
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-5 leading-relaxed">
          {service.description}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href={`/admin/services/${service.id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
            >
              <Eye className="h-4 w-4 mr-2" />
              Détails
            </Button>
          </Link>

          <Link href={`/admin/services/${service.id}/edit`}>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDuplicate(service.id)}
            className="border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
            title="Dupliquer"
          >
            <Copy className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(service.id, service.title)}
            className="border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  const ServiceRow = ({ service }: { service: ServiceType }) => (
    <div className="group bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {/* Image */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
          {service.image ? (
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white/50" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {service.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  service.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    service.isActive ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
                {service.isActive ? 'Actif' : 'Inactif'}
              </span>

              {service.price && service.price > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {service.formattedPrice}
                </span>
              )}

              <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                #{service.displayOrder}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm line-clamp-1 mb-0">{service.description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => handleToggleStatus(service.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={service.isActive ? 'Désactiver' : 'Activer'}
          >
            {service.isActive ? (
              <EyeOff className="h-4 w-4 text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-600" />
            )}
          </button>

          <Link href={`/admin/services/${service.id}`}>
            <Button variant="outline" size="sm" className="border-gray-200">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>

          <Link href={`/admin/services/${service.id}/edit`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDuplicate(service.id)}
            className="border-gray-200"
            title="Dupliquer"
          >
            <Copy className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(service.id, service.title)}
            className="border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Head title="Gestion des Services" />

      <div className="min-h-screen bg-gray-50/30 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Gestion des Services
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Créez et gérez vos services avec une interface moderne et intuitive
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link href={'/services'} target="_blank" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-gray-300 hover:border-blue-400 hover:text-blue-600"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Aperçu public
                </Button>
              </Link>

              <Link href={'/admin/services/create'} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un service
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistiques compactes */}
          <Card className="p-4 sm:p-6 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-900 mb-1">
                  {stats.total}
                </div>
                <div className="text-xs sm:text-sm text-blue-600 font-medium">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-1">
                  {stats.active}
                </div>
                <div className="text-xs sm:text-sm text-emerald-600 font-medium">Actifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-900 mb-1">
                  {stats.inactive}
                </div>
                <div className="text-xs sm:text-sm text-red-600 font-medium">Inactifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-900 mb-1">
                  {stats.withPrice}
                </div>
                <div className="text-xs sm:text-sm text-yellow-600 font-medium">Avec prix</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-900 mb-1">
                  {stats.withoutPrice}
                </div>
                <div className="text-xs sm:text-sm text-purple-600 font-medium">Sur devis</div>
              </div>
            </div>
          </Card>

          {/* Filtres et recherche */}
          <Card className="p-4 sm:p-6 border-0 shadow-lg bg-white">
            <div className="space-y-4">
              {/* Ligne de recherche */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un service par nom, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Filtres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white text-sm"
                >
                  <option value="">Tous les statuts</option>
                  <option value="true">Actifs uniquement</option>
                  <option value="false">Inactifs uniquement</option>
                </select>

                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white text-sm"
                >
                  <option value="">Tous les prix</option>
                  <option value="with">Avec prix</option>
                  <option value="without">Sur devis</option>
                </select>

                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-2 rounded text-sm font-medium transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid className="h-4 w-4 mx-auto sm:mr-2 sm:mx-0 sm:inline" />
                    <span className="hidden sm:inline">Grille</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-2 rounded text-sm font-medium transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="h-4 w-4 mx-auto sm:mr-2 sm:mx-0 sm:inline" />
                    <span className="hidden sm:inline">Liste</span>
                  </button>
                </div>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-gray-300 hover:border-gray-400 h-10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>

              {/* Tri et résultats */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 mr-2">Trier par:</span>
                  <SortButton field="title">Titre</SortButton>
                  <SortButton field="displayOrder">Ordre</SortButton>
                  <SortButton field="price">Prix</SortButton>
                  <SortButton field="isActive">Statut</SortButton>
                </div>

                <p className="text-sm text-gray-600 font-medium">
                  {filteredAndSortedServices.length} résultat
                  {filteredAndSortedServices.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card>

          {/* Affichage des services */}
          {paginatedServices.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {paginatedServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedServices.map((service) => (
                    <ServiceRow key={service.id} service={service} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card className="p-8 sm:p-16 text-center border-0 shadow-lg bg-white">
              <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                <div className="p-6 bg-gray-100 rounded-full">
                  <Star className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                    {searchTerm || statusFilter || priceFilter
                      ? 'Aucun résultat'
                      : 'Créez votre premier service'}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                    {searchTerm || statusFilter || priceFilter
                      ? 'Aucun service ne correspond à vos critères. Essayez de modifier vos filtres.'
                      : 'Commencez à présenter vos services avec une interface professionnelle et moderne.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {(searchTerm || statusFilter || priceFilter) && (
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="border-gray-300 hover:border-gray-400"
                      >
                        Réinitialiser les filtres
                      </Button>
                    )}
                    <Link href={'/admin/services/create'}>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <Plus className="h-4 w-4 mr-2" />
                        Créer mon premier service
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="p-4 sm:p-6 border-0 shadow-lg bg-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 font-medium">
                  Page {currentPage} sur {totalPages} • {filteredAndSortedServices.length} résultat
                  {filteredAndSortedServices.length > 1 ? 's' : ''}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Précédent
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className={`w-8 h-8 p-0 ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border-gray-300 hover:border-blue-400 hover:text-blue-600'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant →
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le service"
        message="Cette action est définitive. Le service et toutes ses données associées seront supprimés."
        itemName={deleteModal.serviceName}
        isLoading={deleteModal.isLoading}
      />
    </>
  )
}

AdminServicesIndex.layout = (page: React.ReactNode) => (
  <AdminLayout title="Services" description="Gestion des services" currentPath="/admin/services">
    {page}
  </AdminLayout>
)
