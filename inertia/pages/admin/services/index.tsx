import React, { useState, useMemo } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import ConfirmationModal from '~/components/ConfirmationModal'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Image as ImageIcon,
  ExternalLink,
  Filter,
  Grid,
  List,
  DollarSign,
  X,
  SortAsc,
  SortDesc,
  GripVertical,
  Check,
} from 'lucide-react'
import { ServiceType } from '~/types/services'
import SafeHTML from '~/components/safeHTML'

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
  const [isReordering, setIsReordering] = useState(false)
  const [reorderedServices, setReorderedServices] = useState<ServiceType[]>([])
  const itemsPerPage = 12

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    serviceId: null as number | null,
    serviceName: '',
    isLoading: false,
  })

  // Filtrage et tri côté client
  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...(isReordering ? reorderedServices : services.data)]

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
    if (!isReordering) {
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
    }

    return filtered
  }, [
    services.data,
    reorderedServices,
    isReordering,
    searchTerm,
    statusFilter,
    priceFilter,
    sortField,
    sortDirection,
  ])

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

  const handleDuplicate = (serviceId: number) => {
    router.post(
      `/admin/services/${serviceId}/duplicate`,
      {},
      {
        preserveScroll: true,
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
      preserveScroll: true,
      onError: () => {
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

  const startReordering = () => {
    setIsReordering(true)
    setReorderedServices([...services.data].sort((a, b) => a.displayOrder - b.displayOrder))
  }

  const cancelReordering = () => {
    setIsReordering(false)
    setReorderedServices([])
  }

  const saveReordering = () => {
    const servicesToSave = reorderedServices.map((service, index) => ({
      id: service.id,
      displayOrder: index + 1,
    }))

    router.patch(
      '/admin/reorder/services',
      { services: servicesToSave },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsReordering(false)
          setReorderedServices([])
        },
      }
    )
  }

  const moveService = (index: number, direction: 'up' | 'down') => {
    const newServices = [...reorderedServices]
    if (direction === 'up' && index > 0) {
      ;[newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]]
      setReorderedServices(newServices)
    } else if (direction === 'down' && index < newServices.length - 1) {
      ;[newServices[index + 1], newServices[index]] = [newServices[index], newServices[index + 1]]
      setReorderedServices(newServices)
    }
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

  const ServiceCard = ({ service, index }: { service: ServiceType; index: number }) => (
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg overflow-hidden">
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {service.publicUrl ? (
          <img
            src={service.publicUrl}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              service.isActive
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                service.isActive ? 'bg-green-600' : 'bg-gray-600'
              }`}
            />
            {service.isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>

        {/* Order Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-white/90 text-gray-700 border border-gray-200">
            #{service.displayOrder}
          </span>
        </div>

        {/* Reorder Handle */}
        {isReordering && (
          <div className="absolute top-3 left-3">
            <div className="p-2 bg-white rounded-lg shadow-md cursor-move">
              <GripVertical className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {service.title}
          </h3>
          {service.price && service.price > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 ml-2 flex-shrink-0">
              <DollarSign className="h-3.5 w-3.5 mr-0.5" />
              {service.formattedPrice}
            </span>
          )}
        </div>

        <SafeHTML className="text-gray-600 text-sm line-clamp-2 mb-4" html={service.description} />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isReordering ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveService(index, 'up')}
                disabled={index === 0}
                className="flex-1 border-gray-300"
              >
                ↑
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveService(index, 'down')}
                disabled={index === reorderedServices.length - 1}
                className="flex-1 border-gray-300"
              >
                ↓
              </Button>
            </>
          ) : (
            <>
              <Link href={`/admin/services/${service.id}`} className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir
                </Button>
              </Link>

              <Link href={`/admin/services/${service.id}/edit`}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDuplicate(service.id)}
                className="border-gray-300 hover:border-green-400 hover:bg-green-50 hover:text-green-700"
                title="Dupliquer"
              >
                <Copy className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(service.id, service.title)}
                className="border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const ServiceRow = ({ service, index }: { service: ServiceType; index: number }) => (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Reorder Handle */}
        {isReordering && (
          <div className="cursor-move p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
            <GripVertical className="h-5 w-5" />
          </div>
        )}

        {/* Image */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
          {service.publicUrl ? (
            <img
              src={service.publicUrl}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {service.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  service.isActive
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    service.isActive ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                />
                {service.isActive ? 'Actif' : 'Inactif'}
              </span>

              {service.price && service.price > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {service.formattedPrice}
                </span>
              )}

              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                #{service.displayOrder}
              </span>
            </div>
          </div>

          <SafeHTML
            className="text-gray-600 text-sm line-clamp-1 mb-0"
            html={service.description}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {isReordering ? (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveService(index, 'up')}
                disabled={index === 0}
                className="p-2 border-gray-300"
              >
                ↑
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveService(index, 'down')}
                disabled={index === reorderedServices.length - 1}
                className="p-2 border-gray-300"
              >
                ↓
              </Button>
            </div>
          ) : (
            <>
              <Link href={`/admin/services/${service.id}`}>
                <Button variant="outline" size="sm" className="border-gray-300">
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
                className="border-gray-300 hover:bg-green-50 hover:border-green-400 hover:text-green-700"
                title="Dupliquer"
              >
                <Copy className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(service.id, service.title)}
                className="border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Head title="Gestion des Services" />

      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Gestion des Services
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Gérez vos services de manière simple et efficace
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {isReordering ? (
                <div className="flex gap-2">
                  <Button
                    onClick={cancelReordering}
                    variant="outline"
                    className="border-gray-300 hover:border-gray-400"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={saveReordering}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={startReordering}
                    variant="outline"
                    className="border-gray-300 hover:border-gray-400"
                  >
                    <GripVertical className="h-4 w-4 mr-2" />
                    Réorganiser
                  </Button>
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
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un service
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <Card className="p-6 border-gray-200 shadow-sm bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
                <div className="text-sm text-gray-600 font-medium">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{stats.active}</div>
                <div className="text-sm text-gray-600 font-medium">Actifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600 mb-1">{stats.inactive}</div>
                <div className="text-sm text-gray-600 font-medium">Inactifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{stats.withPrice}</div>
                <div className="text-sm text-gray-600 font-medium">Avec prix</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">{stats.withoutPrice}</div>
                <div className="text-sm text-gray-600 font-medium">Sur devis</div>
              </div>
            </div>
          </Card>

          {/* Filtres et recherche */}
          <Card className="p-5 border-gray-200 shadow-sm bg-white">
            <div className="space-y-4">
              {/* Ligne de recherche */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Filtres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                >
                  <option value="">Tous les statuts</option>
                  <option value="true">Actifs uniquement</option>
                  <option value="false">Inactifs uniquement</option>
                </select>

                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                >
                  <option value="">Tous les prix</option>
                  <option value="with">Avec prix</option>
                  <option value="without">Sur devis</option>
                </select>

                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-2 rounded-md text-sm font-medium transition-all ${
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
                    className={`flex-1 p-2 rounded-md text-sm font-medium transition-all ${
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
                  variant="outline"
                  onClick={handleReset}
                  className="h-10 border-gray-300 hover:border-gray-400"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </Card>

          {/* Services List/Grid */}
          <div className="space-y-5">
            {/* Sort Controls */}
            {!isReordering && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Trier par :</span>
                <SortButton field="displayOrder">Ordre d'affichage</SortButton>
                <SortButton field="title">Titre</SortButton>
                <SortButton field="price">Prix</SortButton>
                <SortButton field="isActive">Statut</SortButton>
              </div>
            )}

            {/* Services Grid/List */}
            {paginatedServices.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                    : 'space-y-4'
                }
              >
                {paginatedServices.map((service, index) =>
                  viewMode === 'grid' ? (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      index={
                        isReordering
                          ? reorderedServices.findIndex((s) => s.id === service.id)
                          : index
                      }
                    />
                  ) : (
                    <ServiceRow
                      key={service.id}
                      service={service}
                      index={
                        isReordering
                          ? reorderedServices.findIndex((s) => s.id === service.id)
                          : index
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <Card className="p-12 text-center border-gray-200 shadow-sm">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun service trouvé</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || statusFilter || priceFilter
                      ? 'Aucun service ne correspond à vos critères de recherche.'
                      : 'Commencez par créer votre premier service.'}
                  </p>
                  {!searchTerm && !statusFilter && !priceFilter && (
                    <Link href={'/admin/services/create'}>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un service
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Card className="p-4 border-gray-200 shadow-sm bg-white">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Affichage de{' '}
                    <span className="font-semibold text-gray-900">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{' '}
                    à{' '}
                    <span className="font-semibold text-gray-900">
                      {Math.min(currentPage * itemsPerPage, filteredAndSortedServices.length)}
                    </span>{' '}
                    sur{' '}
                    <span className="font-semibold text-gray-900">
                      {filteredAndSortedServices.length}
                    </span>{' '}
                    services
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="border-gray-300"
                    >
                      Précédent
                    </Button>

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
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            onClick={() => setCurrentPage(pageNum)}
                            className={
                              currentPage === pageNum
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'border-gray-300'
                            }
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="border-gray-300"
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le service"
        message="Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible."
        itemName={deleteModal.serviceName}
        isLoading={deleteModal.isLoading}
      />
    </>
  )
}

AdminServicesIndex.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Gestion des Services"
    description="Créez et gérez vos services"
    currentPath="/admin/services"
  >
    {page}
  </AdminLayout>
)
