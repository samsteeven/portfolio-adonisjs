import React, { useState, useMemo } from 'react'
import { Link, router } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Search,
  Filter,
  Mail,
  Phone,
  User,
  Clock,
  CheckCircle,
  MessageSquare,
  Reply,
  Trash2,
  Eye,
  Calendar,
  AlertCircle,
  Archive,
  Star,
  X,
  SortAsc,
  SortDesc,
} from 'lucide-react'
import { ContactRequestType } from '~/types/contact_request'
import { toast } from 'sonner'
import { ServiceType } from '~/types/services'
import ContactRequestReplyModal from '~/components/ContactRequestReplyModal'
import { IsRestricted } from '~/components/IsRestricted'
import ConfirmationModal from '~/components/ConfirmationModal'

interface Props {
  contactRequests: {
    data: ContactRequestType[]
    meta: {
      page: number
      lastPage: number
      total: number
      perPage: number
    }
  }
  services: ServiceType[]
  filters: {
    search?: string
    status?: string
    serviceId?: number
    hasService?: string
    dateFrom?: string
    dateTo?: string
  }
  stats: {
    total: number
    pending: number
    read: number
    replied: number
    closed: number
    withService: number
    withoutService: number
  }
  isRestricted: boolean
}

type SortField = 'date' | 'name' | 'status' | 'service'
type SortDirection = 'asc' | 'desc'

export default function AdminContactRequestsIndex({
  contactRequests,
  services,
  stats,
  isRestricted,
}: Props) {
  if (isRestricted) {
    return (
      <IsRestricted
        message={"Vous n'avez pas les permissions nécessaires pour consulter cette page."}
      />
    )
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [hasServiceFilter, setHasServiceFilter] = useState('')
  const [selectedRequests, setSelectedRequests] = useState<number[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [replyModalOpen, setReplyModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<ContactRequestType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedContactRequest, setSelectedContactRequest] = useState<ContactRequestType | null>(
    null
  )
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtrage et tri côté client
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = [...contactRequests.data]

    // Recherche textuelle
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (request) =>
          request.fullName.toLowerCase().includes(searchLower) ||
          request.email.toLowerCase().includes(searchLower) ||
          request.message.toLowerCase().includes(searchLower) ||
          (request.phone && request.phone.toLowerCase().includes(searchLower))
      )
    }

    // Filtre par statut
    if (statusFilter) {
      filtered = filtered.filter((request) => request.status === statusFilter)
    }

    // Filtre par service
    if (serviceFilter) {
      filtered = filtered.filter((request) => request.service?.id.toString() === serviceFilter)
    }

    // Filtre présence de service
    if (hasServiceFilter) {
      if (hasServiceFilter === 'with') {
        filtered = filtered.filter((request) => request.service)
      } else if (hasServiceFilter === 'without') {
        filtered = filtered.filter((request) => !request.service)
      }
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'date':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'name':
          aValue = a.fullName.toLowerCase()
          bValue = b.fullName.toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'service':
          aValue = a.service?.title || ''
          bValue = b.service?.title || ''
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [
    contactRequests.data,
    searchTerm,
    statusFilter,
    serviceFilter,
    hasServiceFilter,
    sortField,
    sortDirection,
  ])

  // Pagination côté client
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedRequests.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedRequests, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage)

  const handleReset = () => {
    setSearchTerm('')
    setStatusFilter('')
    setServiceFilter('')
    setHasServiceFilter('')
    setCurrentPage(1)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  const handleStatusChange = (requestId: number, newStatus: string) => {
    router.patch(
      `/admin/contact-requests/${requestId}/status`,
      { status: newStatus },
      {
        preserveScroll: true,
      }
    )
  }

  const handleBulkMarkAsRead = () => {
    if (selectedRequests.length === 0) {
      toast.error('Aucune demande sélectionnée')
      return
    }

    router.patch(
      '/admin/contact-requests/bulk-mark-as-read/contacts',
      {
        ids: selectedRequests,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedRequests([])
          setShowBulkActions(false)
        },
      }
    )
  }

  const handleSelectAll = () => {
    const pendingRequestIds = paginatedRequests
      .filter((req) => req.status === 'pending')
      .map((req) => req.id)

    if (selectedRequests.length === pendingRequestIds.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(pendingRequestIds)
    }
  }

  const handleReplyClick = (contactRequest: ContactRequestType) => {
    setSelectedContactRequest(contactRequest)
    setReplyModalOpen(true)
  }

  const handleDeleteClick = (contactRequest: ContactRequestType) => {
    setRequestToDelete(contactRequest)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!requestToDelete) return

    setIsDeleting(true)
    router.delete(`/admin/contact-requests/${requestToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setDeleteModalOpen(false)
        setRequestToDelete(null)
        setIsDeleting(false)
      },
      onError: () => {
        setIsDeleting(false)
      },
    })
  }

  const handleReplySuccess = () => {
    router.reload()
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: Clock,
          label: 'En attente',
          dot: 'bg-amber-600',
        }
      case 'read':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Eye,
          label: 'Lu',
          dot: 'bg-blue-600',
        }
      case 'replied':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Reply,
          label: 'Répondu',
          dot: 'bg-green-600',
        }
      case 'closed':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Archive,
          label: 'Fermé',
          dot: 'bg-gray-600',
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          label: 'Inconnu',
          dot: 'bg-gray-600',
        }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`
    } else if (diffInHours < 168) {
      return `Il y a ${Math.floor(diffInHours / 24)}j`
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    }
  }

  const getPriorityColor = (request: ContactRequestType) => {
    const hoursSinceCreation = Math.floor(
      (new Date().getTime() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60)
    )

    if (request.status === 'pending' && hoursSinceCreation > 24) {
      return 'border-l-red-500 bg-red-50'
    } else if (request.status === 'pending' && hoursSinceCreation > 6) {
      return 'border-l-amber-500 bg-amber-50'
    } else if (request.service) {
      return 'border-l-blue-500 bg-blue-50'
    }
    return 'border-l-gray-300 bg-white'
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

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Demandes de Contact
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Gérez et suivez toutes vos demandes clients
              </p>
            </div>
          </div>

          {/* Statistiques */}
          <Card className="p-6 border-gray-200 shadow-sm bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
                <div className="text-sm text-gray-600 font-medium">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-1">{stats.pending}</div>
                <div className="text-sm text-gray-600 font-medium">En attente</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{stats.replied}</div>
                <div className="text-sm text-gray-600 font-medium">Répondues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600 mb-1">{stats.closed}</div>
                <div className="text-sm text-gray-600 font-medium">Fermées</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{stats.withService}</div>
                <div className="text-sm text-gray-600 font-medium">Services</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {stats.withoutService}
                </div>
                <div className="text-sm text-gray-600 font-medium">Générales</div>
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
                  placeholder="Rechercher par nom, email, message..."
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
                  <option value="pending">En attente</option>
                  <option value="read">Lu</option>
                  <option value="replied">Répondu</option>
                  <option value="closed">Fermé</option>
                </select>

                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                >
                  <option value="">Tous les services</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>

                <select
                  value={hasServiceFilter}
                  onChange={(e) => setHasServiceFilter(e.target.value)}
                  className="h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                >
                  <option value="">Service ou générale</option>
                  <option value="with">Avec service</option>
                  <option value="without">Sans service</option>
                </select>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-gray-300 hover:border-gray-400 h-10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>

              {/* Tri et options */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 font-medium mr-2">Trier par:</span>
                  <SortButton field="date">Date</SortButton>
                  <SortButton field="name">Nom</SortButton>
                  <SortButton field="status">Statut</SortButton>
                  <SortButton field="service">Service</SortButton>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-600 font-medium">
                    {filteredAndSortedRequests.length} résultat
                    {filteredAndSortedRequests.length > 1 ? 's' : ''}
                  </p>

                  {paginatedRequests.some((req) => req.status === 'pending') && (
                    <Button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      variant="outline"
                      size="sm"
                      className={`border-gray-300 hover:border-blue-400 transition-colors ${
                        showBulkActions ? 'bg-blue-50 border-blue-400 text-blue-600' : ''
                      }`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Sélection
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Actions en lot */}
          {showBulkActions && (
            <Card className="p-4 border-gray-200 shadow-sm bg-blue-50 border-l-4 border-l-blue-600">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedRequests.length > 0 &&
                        selectedRequests.length ===
                          paginatedRequests.filter((req) => req.status === 'pending').length
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">
                      {selectedRequests.length === 0
                        ? 'Sélectionner tout'
                        : `${selectedRequests.length} sélectionnée${selectedRequests.length > 1 ? 's' : ''}`}
                    </span>
                  </div>

                  {selectedRequests.length > 0 && (
                    <Button
                      onClick={handleBulkMarkAsRead}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Marquer comme lues
                    </Button>
                  )}
                </div>

                <Button
                  onClick={() => {
                    setShowBulkActions(false)
                    setSelectedRequests([])
                  }}
                  variant="outline"
                  size="sm"
                  className="border-gray-300"
                >
                  Annuler
                </Button>
              </div>
            </Card>
          )}

          {/* Liste des demandes */}
          {paginatedRequests.length > 0 ? (
            <div className="space-y-4">
              {paginatedRequests.map((request) => {
                const statusConfig = getStatusConfig(request.status)

                return (
                  <Card
                    key={request.id}
                    className={`border-l-4 border-gray-200 shadow-sm hover:shadow-md transition-shadow ${getPriorityColor(request)}`}
                  >
                    <div className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Contenu principal */}
                        <div className="flex-1 space-y-4">
                          {/* En-tête */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {request.fullName}
                                </h3>

                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig.dot}`}
                                  />
                                  {statusConfig.label}
                                </span>

                                {request.service && (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                    <Star className="h-3 w-3 mr-1" />
                                    <Link
                                      href={`/admin/services/${request.service.id}`}
                                      as="span"
                                      className="truncate max-w-32 hover:cursor-pointer"
                                    >
                                      {request.service.title}
                                    </Link>
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Mail className="h-4 w-4 flex-shrink-0" />
                                  <span className="font-medium truncate">{request.email}</span>
                                </div>

                                {request.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 flex-shrink-0" />
                                    <span>{request.phone}</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 flex-shrink-0" />
                                  <span>{formatDate(request.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Aperçu du message */}
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-gray-700 line-clamp-2 leading-relaxed text-sm">
                              {request.message}
                            </p>
                          </div>

                          {/* Actions rapides */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            {showBulkActions && request.status === 'pending' && (
                              <input
                                type="checkbox"
                                checked={selectedRequests.includes(request.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRequests([...selectedRequests, request.id])
                                  } else {
                                    setSelectedRequests(
                                      selectedRequests.filter((id) => id !== request.id)
                                    )
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            )}

                            <select
                              value={request.status}
                              onChange={(e) => handleStatusChange(request.id, e.target.value)}
                              className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium"
                            >
                              <option value="pending">En attente</option>
                              <option value="read">Lu</option>
                              <option value="replied">Répondu</option>
                              <option value="closed">Fermé</option>
                            </select>
                          </div>
                        </div>

                        {/* Panneau d'actions */}
                        <div className="flex sm:flex-col lg:flex-row items-center gap-2">
                          {/*<Link href={`/admin/contact-requests/${request.id}`}>*/}
                          {/*  <Button*/}
                          {/*    variant="outline"*/}
                          {/*    size="sm"*/}
                          {/*    className="border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"*/}
                          {/*  >*/}
                          {/*    <Eye className="h-4 w-4" />*/}
                          {/*  </Button>*/}
                          {/*</Link>*/}

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-300 hover:border-green-400 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleReplyClick(request)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteClick(request)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="p-12 text-center border-gray-200 shadow-sm bg-white">
              <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                <div className="p-6 bg-gray-100 rounded-full">
                  <MessageSquare className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {searchTerm || statusFilter || serviceFilter || hasServiceFilter
                      ? 'Aucun résultat trouvé'
                      : 'Aucune demande reçue'}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                    {searchTerm || statusFilter || serviceFilter || hasServiceFilter
                      ? 'Aucune demande ne correspond à vos critères. Essayez de modifier vos filtres.'
                      : 'Les nouvelles demandes de contact apparaîtront ici.'}
                  </p>
                  {(searchTerm || statusFilter || serviceFilter || hasServiceFilter) && (
                    <Button
                      onClick={handleReset}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Réinitialiser les filtres
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="p-4 border-gray-200 shadow-sm bg-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 font-medium">
                  Page {currentPage} sur {totalPages} • {filteredAndSortedRequests.length} résultat
                  {filteredAndSortedRequests.length > 1 ? 's' : ''}
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

      {/* Modal de réponse */}
      {selectedContactRequest && (
        <ContactRequestReplyModal
          contactRequest={selectedContactRequest}
          isOpen={replyModalOpen}
          onClose={() => {
            setReplyModalOpen(false)
            setSelectedContactRequest(null)
          }}
          onSuccess={handleReplySuccess}
        />
      )}

      {/* Modal de suppression */}
      {requestToDelete && (
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false)
            setRequestToDelete(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Supprimer la demande de contact"
          message="Êtes-vous sûr de vouloir supprimer cette demande de contact ? Cette action est irréversible."
          itemName={requestToDelete.fullName}
          isLoading={isDeleting}
        />
      )}
    </>
  )
}

AdminContactRequestsIndex.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Demandes de Contact"
    description="Gestion des demandes de contact"
    currentPath="/admin/contact-requests"
  >
    {page}
  </AdminLayout>
)
