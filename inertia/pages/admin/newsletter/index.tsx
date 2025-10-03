import React, { useState, useMemo, useEffect } from 'react'
import { router } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'
import { Mail, Search, Trash2, UserCheck, UserX, Calendar, Users, Filter, X } from 'lucide-react'

interface Subscriber {
  id: number
  email: string
  isActive: boolean
  subscribedAt: string
  confirmedAt?: string
  token: string
}

interface NewsletterStats {
  totalSubscribers: number
  activeSubscribers: number
  recentSubscribers: number
  unsubscribeRate: number
}

interface NewsletterAdminProps {
  subscribers: {
    data: Subscriber[]
    meta: {
      currentPage: number
      lastPage: number
      total: number
    }
  }
  stats: NewsletterStats
  filters: {
    search?: string
    status?: string
  }
}

export default function NewsletterAdmin({ subscribers }: NewsletterAdminProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selectedEmails, setSelectedEmails] = useState<number[]>([])
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    subscriberId: null as number | null,
    subscriberEmail: '',
    isLoading: false,
  })
  const [bulkDeleteModal, setBulkDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  })
  const [isclient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Filtrage côté client
  const filteredSubscribers = useMemo(() => {
    let filtered = [...subscribers.data]

    // Filtrage par recherche (email uniquement)
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim()
      filtered = filtered.filter((subscriber) =>
        subscriber.email.toLowerCase().includes(searchLower)
      )
    }

    // Filtrage par statut
    if (status) {
      switch (status) {
        case 'active':
          filtered = filtered.filter((subscriber) => subscriber.isActive && subscriber.confirmedAt)
          break
        case 'inactive':
          filtered = filtered.filter((subscriber) => !subscriber.isActive)
          break
        case 'unconfirmed':
          filtered = filtered.filter((subscriber) => subscriber.isActive && !subscriber.confirmedAt)
          break
      }
    }

    return filtered
  }, [subscribers.data, search, status])

  // Stats dynamiques basées sur les données filtrées
  const dynamicStats = useMemo(() => {
    const total = subscribers.data.length
    const active = subscribers.data.filter((s) => s.isActive && s.confirmedAt).length
    const unconfirmed = subscribers.data.filter((s) => s.isActive && !s.confirmedAt).length
    const inactive = subscribers.data.filter((s) => !s.isActive).length

    return {
      total,
      active,
      unconfirmed,
      inactive,
    }
  }, [subscribers.data])

  const formatDate = (dateString: string) => {
    if (!isclient) return '...'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const resetFilters = () => {
    setSearch('')
    setStatus('')
  }

  const toggleSelectAll = () => {
    if (selectedEmails.length === filteredSubscribers.length) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(filteredSubscribers.map((s) => s.id))
    }
  }

  const toggleSelectEmail = (id: number) => {
    setSelectedEmails((prev) =>
      prev.includes(id) ? prev.filter((emailId) => emailId !== id) : [...prev, id]
    )
  }

  const handleDelete = (id: number, email: string) => {
    setDeleteModal({
      isOpen: true,
      subscriberId: id,
      subscriberEmail: email,
      isLoading: false,
    })
  }

  const confirmDelete = () => {
    if (!deleteModal.subscriberId) return

    setDeleteModal((prev) => ({ ...prev, isLoading: true }))

    router.delete(`/admin/newsletter/${deleteModal.subscriberId}`, {
      onSuccess: () => {
        setDeleteModal({
          isOpen: false,
          subscriberId: null,
          subscriberEmail: '',
          isLoading: false,
        })
      },
      onError: () => {
        setDeleteModal((prev) => ({ ...prev, isLoading: false }))
      },
    })
  }

  const handleBulkDelete = () => {
    setBulkDeleteModal({ isOpen: true, isLoading: false })
  }

  const confirmBulkDelete = () => {
    setBulkDeleteModal((prev) => ({ ...prev, isLoading: true }))

    router.delete('/admin/newsletter/bulk', {
      data: { ids: selectedEmails },
      onSuccess: () => {
        setSelectedEmails([])
        setBulkDeleteModal({ isOpen: false, isLoading: false })
      },
      onError: () => {
        setBulkDeleteModal((prev) => ({ ...prev, isLoading: false }))
      },
    })
  }

  const toggleSubscriberStatus = (id: number, currentStatus: boolean) => {
    router.patch(
      `/admin/newsletter/${id}`,
      {
        isActive: !currentStatus,
      },
      {
        preserveScroll: true,
      }
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Newsletter</h1>
                <p className="text-gray-600 mt-2">Gérez vos abonnés et vos campagnes d'emailing</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total abonnés</p>
                    <p className="text-xl font-semibold">{dynamicStats.total}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Actifs</p>
                    <p className="text-xl font-semibold">{dynamicStats.active}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Mail className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">En attente</p>
                    <p className="text-xl font-semibold">{dynamicStats.unconfirmed}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <UserX className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Inactifs</p>
                    <p className="text-xl font-semibold">{dynamicStats.inactive}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher par email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-48">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 focus:border-transparant border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                  <option value="unconfirmed">Non confirmés</option>
                </select>
              </div>

              {(search || status) && (
                <Button onClick={resetFilters} variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Effacer les filtres
                </Button>
              )}
            </div>

            {/* Active filters display */}
            {(search || status) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">Filtres actifs:</span>
                {search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    Email: "{search}"
                    <button onClick={() => setSearch('')} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {status && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    Statut:{' '}
                    {status === 'active'
                      ? 'Actifs'
                      : status === 'inactive'
                        ? 'Inactifs'
                        : 'Non confirmés'}
                    <button onClick={() => setStatus('')} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </Card>

          {/* Results count */}
          {(search || status) && (
            <div className="mb-4 text-sm text-gray-600">
              {filteredSubscribers.length} résultat{filteredSubscribers.length > 1 ? 's' : ''}{' '}
              trouvé{filteredSubscribers.length > 1 ? 's' : ''}
              {filteredSubscribers.length !== subscribers.data.length &&
                ` sur ${subscribers.data.length} abonnés`}
            </div>
          )}

          {/* Bulk Actions */}
          {selectedEmails.length > 0 && (
            <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  {selectedEmails.length} abonné(s) sélectionné(s)
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedEmails([])}>
                    Annuler
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Subscribers Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedEmails.length === filteredSubscribers.length &&
                          filteredSubscribers.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confirmation
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(subscriber.id)}
                          onChange={() => toggleSelectEmail(subscriber.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-900">
                            {subscriber.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            subscriber.isActive && subscriber.confirmedAt
                              ? 'bg-green-100 text-green-800'
                              : subscriber.isActive && !subscriber.confirmedAt
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {subscriber.isActive && subscriber.confirmedAt
                            ? 'Actif'
                            : subscriber.isActive && !subscriber.confirmedAt
                              ? 'En attente'
                              : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(subscriber.subscribedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {subscriber.confirmedAt ? (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(subscriber.confirmedAt)}
                          </div>
                        ) : (
                          <span className="text-gray-400">Non confirmé</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              toggleSubscriberStatus(subscriber.id, subscriber.isActive)
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              subscriber.isActive
                                ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={subscriber.isActive ? 'Désactiver' : 'Activer'}
                          >
                            {subscriber.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete(subscriber.id, subscriber.email)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredSubscribers.length === 0 && (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {search || status ? 'Aucun résultat trouvé' : 'Aucun abonné trouvé'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {search || status
                    ? 'Aucun abonné ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                    : "Votre liste d'abonnés est vide pour le moment."}
                </p>
                {search || status ? (
                  <Button onClick={resetFilters} variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Effacer les filtres
                  </Button>
                ) : null}
              </div>
            )}
          </Card>

          {/* Info sur le filtrage */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Affichage de {filteredSubscribers.length} abonné
            {filteredSubscribers.length > 1 ? 's' : ''}
            {filteredSubscribers.length !== subscribers.data.length &&
              ` (filtré à partir de ${subscribers.data.length} abonnés)`}
          </div>
        </div>
      </div>

      {/* Delete Modals */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Supprimer l'abonné"
        message="Cette action est irréversible. L'abonné sera définitivement supprimé de votre liste."
        itemName={deleteModal.subscriberEmail}
        isLoading={deleteModal.isLoading}
      />

      <DeleteConfirmationModal
        isOpen={bulkDeleteModal.isOpen}
        onClose={() => setBulkDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmBulkDelete}
        title="Supprimer les abonnés sélectionnés"
        message={`Cette action est irréversible. ${selectedEmails.length} abonné(s) sera/seront définitivement supprimé(s).`}
        itemName={`${selectedEmails.length} abonné(s)`}
        isLoading={bulkDeleteModal.isLoading}
      />
    </>
  )
}

NewsletterAdmin.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Newsletter Admin"
    description="Gestion de la newsletter et des abonnés"
    currentPath="/admin/newsletter/subscribers"
  >
    {page}
  </AdminLayout>
)
