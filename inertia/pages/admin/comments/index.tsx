import { Link, router } from '@inertiajs/react'
import React, { useState, useEffect } from 'react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'
import {
  Search,
  Filter,
  MessageCircle,
  User,
  Calendar,
  Trash2,
  Eye,
  Github,
  Chrome,
  UserCheck,
  Smile,
  X,
  ExternalLink,
  MapPin,
  Globe,
  Users,
  BarChart3,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
} from 'lucide-react'
import { CommentaireType } from '~/types/commentaire'

interface Props {
  commentaires: {
    data: CommentaireType[]
    meta: {
      page: number
      lastPage: number
      total: number
    }
  }
  reactions: {
    positive: string[]
    neutral: string[]
    negative: string[]
  }
  filters?: {
    search?: string
    hasReaction?: string
    commentType?: string
    country?: string
  }
  stats?: {
    total: number
    guests: number
    authenticated: number
    withReactions: number
    topCountries: Array<{ country: string; countryCode: string; count: number }>
  }
}

export default function CommentsIndex({ commentaires, reactions, filters = {}, stats }: Props) {
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [filteredComments, setFilteredComments] = useState<CommentaireType[]>(commentaires.data)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [sortBy, setSortBy] = useState<'createdAt' | 'displayName'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const [selectedStatus, setSelectedStatus] = useState(filters.hasReaction || '')
  const [selectedType, setSelectedType] = useState(filters.commentType || '')
  const [selectedCountry, setSelectedCountry] = useState(filters.country || '')

  // États pour le modal de suppression
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    commentaireId: null as number | null,
    commentaireName: '',
    isLoading: false,
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    let results = [...commentaires.data]

    if (searchTerm) {
      results = results.filter(
        (c) =>
          (c.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.guestName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.guestEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.country || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus) {
      if (selectedStatus === 'true') {
        results = results.filter((c) => !!c.reaction)
      } else if (selectedStatus === 'false') {
        results = results.filter((c) => !c.reaction)
      }
    }

    if (selectedType) {
      results = results.filter((c) => c.commentType === selectedType)
    }

    if (selectedCountry) {
      results = results.filter((c) => c.country === selectedCountry)
    }

    // Tri
    results.sort((a, b) => {
      let aValue: string | Date
      let bValue: string | Date

      switch (sortBy) {
        case 'displayName':
          aValue = (a.displayName || '').toLowerCase()
          bValue = (b.displayName || '').toLowerCase()
          break
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortOrder === 'asc'
        ? (aValue as Date).getTime() - (bValue as Date).getTime()
        : (bValue as Date).getTime() - (aValue as Date).getTime()
    })

    setFilteredComments(results)
  }, [
    searchTerm,
    selectedStatus,
    selectedType,
    selectedCountry,
    commentaires.data,
    sortBy,
    sortOrder,
  ])

  // Fonction pour formater les dates
  const formatDate = (dateString: string, short: boolean = false) => {
    if (!isClient) return '...'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: short ? 'numeric' : '2-digit',
      month: short ? 'short' : '2-digit',
      year: short ? undefined : 'numeric',
      hour: short ? undefined : '2-digit',
      minute: short ? undefined : '2-digit',
    })
  }

  // Fonction de reset des filtres
  const handleReset = () => {
    setSearchTerm('')
    setSelectedStatus('')
    setSelectedType('')
    setSelectedCountry('')
    setSortBy('createdAt')
    setSortOrder('desc')
  }

  // Active filters count
  const activeFiltersCount = [searchTerm, selectedStatus, selectedType, selectedCountry].filter(
    Boolean
  ).length

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      commentaireId: id,
      commentaireName: name,
      isLoading: false,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.commentaireId) return

    setDeleteModal((prev) => ({ ...prev, isLoading: true }))

    router.delete(`/admin/comments/${deleteModal.commentaireId}`, {
      onSuccess: () => {
        setDeleteModal({
          isOpen: false,
          commentaireId: null,
          commentaireName: '',
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
      commentaireId: null,
      commentaireName: '',
      isLoading: false,
    })
  }

  const handleReactionClick = async (commentaireId: number, emoji: string) => {
    setShowReactionPicker(null)

    router.patch(
      `/admin/comments/${commentaireId}/reaction`,
      {
        reaction: emoji,
      },
      {
        preserveScroll: true,
      }
    )
  }

  const handleRemoveReaction = async (commentaireId: number) => {
    router.patch(
      `/admin/comments/${commentaireId}/reaction`,
      {
        reaction: null,
      },
      {
        preserveScroll: true,
      }
    )
  }

  const getProviderIcon = (provider?: string) => {
    switch (provider) {
      case 'github':
        return <Github className="h-4 w-4" />
      case 'google':
        return <Chrome className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getProviderColor = (provider?: string) => {
    switch (provider) {
      case 'github':
        return 'text-gray-700 bg-gray-100'
      case 'google':
        return 'text-blue-700 bg-blue-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'authenticated':
        return 'text-green-700 bg-green-100'
      case 'guest':
        return 'text-blue-700 bg-blue-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  // Fermer le picker d'emojis quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.emoji-picker') && !target.closest('.emoji-button')) {
        setShowReactionPicker(null)
      }
    }

    if (showReactionPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showReactionPicker])

  // Obtenir la liste des pays uniques pour le filtre
  const uniqueCountries = Array.from(
    new Set(commentaires.data.filter((c) => c.country !== null).map((c) => c.country))
  ).sort()

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Commentaires</h1>
              <p className="mt-1 text-gray-600">
                Gérez les commentaires et réactions de votre livre d'or
              </p>
              <div className="mt-1 text-sm text-gray-500">
                {filteredComments.length} commentaire
                {filteredComments.length > 1 ? 's' : ''} sur {commentaires.meta.total} au total
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
              <Button
                variant="outline"
                onClick={() => router.visit('/guestbook')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Voir le livre d'or
              </Button>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Recherche */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Nom, email, message, ville, pays..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value.trim())}
                      className="pl-10 h-10"
                    />
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Type de commentaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Tous</option>
                    <option value="authenticated">Utilisateurs connectés</option>
                    <option value="guest">Visiteurs invités</option>
                  </select>
                </div>

                {/* Statut de réaction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Réactions</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Toutes</option>
                    <option value="true">Avec réaction</option>
                    <option value="false">Sans réaction</option>
                  </select>
                </div>

                {/* Filtre par pays */}
                {uniqueCountries.length > 0 &&
                  uniqueCountries.every((country) => country != null) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">Tous</option>
                        {uniqueCountries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
                      <option value="createdAt">Date création</option>
                      <option value="displayName">Nom</option>
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

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <Card className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Total</p>
                  <p className="text-lg font-semibold">
                    {stats?.total || commentaires.meta.total || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Connectés</p>
                  <p className="text-lg font-semibold">
                    {stats?.authenticated ||
                      commentaires.data.filter((c) => c.commentType === 'authenticated').length ||
                      0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Invités</p>
                  <p className="text-lg font-semibold">
                    {stats?.guests ||
                      commentaires.data.filter((c) => c.commentType === 'guest').length ||
                      0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Smile className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Réactions</p>
                  <p className="text-lg font-semibold">
                    {stats?.withReactions ||
                      commentaires.data.filter((c) => c.reaction).length ||
                      0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Globe className="h-4 w-4 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Pays</p>
                  <p className="text-lg font-semibold">{uniqueCountries.length || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Liste des commentaires */}
          {viewMode === 'list' ? (
            <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        Utilisateur
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        Message
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredComments.map((commentaire) => (
                      <tr key={commentaire.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className={`p-2 rounded-full ${getProviderColor(commentaire.user?.provider)}`}
                            >
                              {getProviderIcon(commentaire.user?.provider)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {commentaire.displayName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {commentaire.displayEmail || commentaire.guestEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 line-clamp-2 max-w-md">
                            {commentaire.message}
                          </div>
                          {commentaire.reaction && (
                            <div className="mt-1 flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg border border-yellow-200 w-fit">
                              <span className="text-lg">{commentaire.reaction}</span>
                              <button
                                onClick={() => handleRemoveReaction(commentaire.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCommentTypeColor(commentaire.commentType)}`}
                          >
                            {commentaire.commentType === 'authenticated' ? (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Connecté
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3 mr-1" />
                                Invité
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(commentaire.createdAt, true)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {/* Reaction button */}
                            <div className="relative">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setShowReactionPicker(
                                    showReactionPicker === commentaire.id ? null : commentaire.id
                                  )
                                }
                                className="border-gray-300 emoji-button"
                              >
                                <Smile className="h-4 w-4" />
                              </Button>

                              {/* Picker d'emojis */}
                              {showReactionPicker === commentaire.id && (
                                <>
                                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 sm:hidden">
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg w-full max-w-sm max-h-[80vh] overflow-y-auto emoji-picker">
                                      <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">
                                          Choisir une réaction
                                        </h3>
                                        <button
                                          onClick={() => setShowReactionPicker(null)}
                                          className="p-1 hover:bg-gray-100 rounded"
                                        >
                                          <X className="h-5 w-5" />
                                        </button>
                                      </div>
                                      <div className="p-4 space-y-4">
                                        <div>
                                          <p className="text-sm font-medium text-gray-700 mb-2">
                                            Positives
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            {reactions.positive.map((emoji) => (
                                              <button
                                                key={emoji}
                                                onClick={() =>
                                                  handleReactionClick(commentaire.id, emoji)
                                                }
                                                className="p-2 hover:bg-gray-100 rounded text-2xl transition-colors"
                                              >
                                                {emoji}
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        <div>
                                          <p className="text-sm font-medium text-gray-700 mb-2">
                                            Neutres
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            {reactions.neutral.map((emoji) => (
                                              <button
                                                key={emoji}
                                                onClick={() =>
                                                  handleReactionClick(commentaire.id, emoji)
                                                }
                                                className="p-2 hover:bg-gray-100 rounded text-2xl transition-colors"
                                              >
                                                {emoji}
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        <div>
                                          <p className="text-sm font-medium text-gray-700 mb-2">
                                            Négatives
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            {reactions.negative.map((emoji) => (
                                              <button
                                                key={emoji}
                                                onClick={() =>
                                                  handleReactionClick(commentaire.id, emoji)
                                                }
                                                className="p-2 hover:bg-gray-100 rounded text-2xl transition-colors"
                                              >
                                                {emoji}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="hidden sm:block absolute right-0 top-full mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-64 emoji-picker">
                                    <div className="space-y-3">
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-2">
                                          Positives
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {reactions.positive.map((emoji) => (
                                            <button
                                              key={emoji}
                                              onClick={() =>
                                                handleReactionClick(commentaire.id, emoji)
                                              }
                                              className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
                                            >
                                              {emoji}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-2">
                                          Neutres
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {reactions.neutral.map((emoji) => (
                                            <button
                                              key={emoji}
                                              onClick={() =>
                                                handleReactionClick(commentaire.id, emoji)
                                              }
                                              className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
                                            >
                                              {emoji}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-2">
                                          Négatives
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {reactions.negative.map((emoji) => (
                                            <button
                                              key={emoji}
                                              onClick={() =>
                                                handleReactionClick(commentaire.id, emoji)
                                              }
                                              className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
                                            >
                                              {emoji}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            <Link href={`/admin/comments/${commentaire.id}`}>
                              <Button size="sm" variant="outline" className="border-gray-300">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClick(commentaire.id, commentaire.message)}
                              className="text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredComments.map((commentaire) => (
                <Card
                  key={commentaire.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 rounded-xl"
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-full ${getProviderColor(commentaire.user?.provider)}`}
                        >
                          {getProviderIcon(commentaire.user?.provider)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {commentaire.displayName}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {commentaire.displayEmail || commentaire.guestEmail}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCommentTypeColor(commentaire.commentType)}`}
                      >
                        {commentaire.commentType === 'authenticated' ? 'Connecté' : 'Invité'}
                      </span>
                    </div>

                    {/* Message */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 line-clamp-3">{commentaire.message}</p>
                    </div>

                    {/* Réaction */}
                    {commentaire.reaction && (
                      <div className="flex items-center gap-1 mb-3 px-2 py-1 bg-yellow-50 rounded-lg border border-yellow-200 w-fit">
                        <span className="text-lg">{commentaire.reaction}</span>
                        <button
                          onClick={() => handleRemoveReaction(commentaire.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {/* Location */}
                    {commentaire.fullLocation && (
                      <div className="flex items-center gap-1 mb-3 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{commentaire.fullLocation}</span>
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(commentaire.createdAt, true)}
                      </div>
                      <span className="text-gray-300">•</span>
                      <span>ID: #{commentaire.id}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Reaction button */}
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setShowReactionPicker(
                              showReactionPicker === commentaire.id ? null : commentaire.id
                            )
                          }
                          className="border-gray-300 emoji-button"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>

                        {showReactionPicker === commentaire.id && (
                          <div className="absolute right-0 top-full mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-64 emoji-picker">
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-2">Positives</p>
                                <div className="flex flex-wrap gap-1">
                                  {reactions.positive.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReactionClick(commentaire.id, emoji)}
                                      className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-2">Neutres</p>
                                <div className="flex flex-wrap gap-1">
                                  {reactions.neutral.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReactionClick(commentaire.id, emoji)}
                                      className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-2">Négatives</p>
                                <div className="flex flex-wrap gap-1">
                                  {reactions.negative.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReactionClick(commentaire.id, emoji)}
                                      className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Link href={`/admin/comments/${commentaire.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full border-gray-300">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(commentaire.id, commentaire.message)}
                        className="text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Top Countries sidebar - affiché seulement sur desktop */}
          {stats?.topCountries && stats.topCountries.length > 0 && (
            <Card className="hidden lg:block mt-6 p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top des pays
              </h3>
              <div className="space-y-3">
                {stats.topCountries.slice(0, 5).map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <span className="text-sm text-gray-900">{country.country}</span>
                      <span className="text-xs text-gray-500 uppercase">{country.countryCode}</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">{country.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Empty State */}
          {filteredComments.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchTerm || selectedStatus || selectedType || selectedCountry
                  ? 'Aucun commentaire trouvé'
                  : 'Aucun commentaire'}
              </h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || selectedStatus || selectedType || selectedCountry
                  ? 'Essayez de modifier vos critères de recherche.'
                  : "Les visiteurs n'ont pas encore laissé de commentaires."}
              </p>
              <div className="mt-6">
                {searchTerm || selectedStatus || selectedType || selectedCountry ? (
                  <Button onClick={handleReset} variant="outline" className="border-gray-300">
                    Réinitialiser les filtres
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.visit('/guestbook')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 mx-auto"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Voir le livre d'or
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {commentaires.meta.lastPage > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700 text-center sm:text-left">
                Page {commentaires.meta.page} sur {commentaires.meta.lastPage} (
                {commentaires.meta.total} commentaires)
              </div>
              <div className="flex items-center gap-2">
                {commentaires.meta.page > 1 && (
                  <Link
                    href={`/admin/comments?page=${commentaires.meta.page - 1}&search=${searchTerm}&hasReaction=${selectedStatus}&commentType=${selectedType}&country=${selectedCountry}`}
                  >
                    <Button variant="outline" className="border-gray-300">
                      Précédent
                    </Button>
                  </Link>
                )}
                {commentaires.meta.page < commentaires.meta.lastPage && (
                  <Link
                    href={`/admin/comments?page=${commentaires.meta.page + 1}&search=${searchTerm}&hasReaction=${selectedStatus}&commentType=${selectedType}&country=${selectedCountry}`}
                  >
                    <Button variant="outline" className="border-gray-300">
                      Suivant
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
        title="Supprimer le commentaire"
        message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce commentaire ?"
        itemName={deleteModal.commentaireName}
        isLoading={deleteModal.isLoading}
      />
    </>
  )
}

CommentsIndex.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Commentaires"
    description="Gestion des commentaires du livre d'or"
    currentPath="/admin/comments"
  >
    {page}
  </AdminLayout>
)
