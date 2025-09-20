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
  Mail,
  Calendar,
  Clock,
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
  Phone,
  Shield,
  Users,
  BarChart3,
  Wifi,
} from 'lucide-react'
import { CommentaireType } from '~/types/commentaire'
import { toast } from 'sonner'

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
    let results = commentaires.data

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

    setFilteredComments(results)
  }, [searchTerm, selectedStatus, selectedType, selectedCountry, commentaires.data])

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
    setFilteredComments(commentaires.data)
  }

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
        toast.error('Erreur lors de la suppression')
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
        onError: () => {
          toast.error("Erreur lors de l'ajout de la réaction")
        },
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
        onError: () => {
          toast.error('Erreur lors de la suppression de la réaction')
        },
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
      <div className="min-h-screen sm:bg-gray-50 sm:p-3">
        <div className="px-3 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
            <div className="flex-auto mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Commentaires</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-700">
                Gérez les commentaires et réactions de votre livre d'or
              </p>
              <div className="mt-2 text-sm text-gray-500">
                {filteredComments.length} commentaire(s) affiché(s) sur {commentaires.meta.total}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.visit('/guestbook')}
                className="border-none"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Voir le livre d'or
              </Button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Total</p>
                  <p className="text-lg sm:text-xl font-semibold">
                    {stats?.total || commentaires.meta.total || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-4 sm:h-5 w-4 sm:w-5 text-green-600" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Connectés</p>
                  <p className="text-lg sm:text-xl font-semibold">
                    {stats?.authenticated ||
                      commentaires.data.filter((c) => c.commentType === 'authenticated').length ||
                      0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Invités</p>
                  <p className="text-lg sm:text-xl font-semibold">
                    {stats?.guests ||
                      commentaires.data.filter((c) => c.commentType === 'guest').length ||
                      0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Smile className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-600" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Réactions</p>
                  <p className="text-lg sm:text-xl font-semibold">
                    {stats?.withReactions ||
                      commentaires.data.filter((c) => c.reaction).length ||
                      0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Globe className="h-4 sm:h-5 w-4 sm:w-5 text-orange-600" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Pays</p>
                  <p className="text-lg sm:text-xl font-semibold">{uniqueCountries.length || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtres */}
          <Card className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white">
            <div className="space-y-4">
              {/* Recherche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type de commentaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tous les types</option>
                    <option value="authenticated">Utilisateurs connectés</option>
                    <option value="guest">Visiteurs invités</option>
                  </select>
                </div>

                {/* Statut de réaction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Réactions</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Tous les pays</option>
                        {uniqueCountries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                {/* Actions */}
                <div className="flex items-end">
                  <Button variant="ghost" onClick={handleReset} className="border-none w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Liste des commentaires */}
          <div className="space-y-4">
            {filteredComments.map((commentaire) => (
              <Card key={commentaire.id} className="bg-white hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  {/* Version mobile */}
                  <div className="block sm:hidden">
                    <div className="flex items-start gap-3 mb-3">
                      {/* Avatar */}
                      <div
                        className={`p-2 rounded-full flex-shrink-0 ${getProviderColor(commentaire.user?.provider)}`}
                      >
                        {getProviderIcon(commentaire.user?.provider)}
                      </div>

                      {/* Info utilisateur */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {commentaire.displayName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getCommentTypeColor(commentaire.commentType)}`}
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
                              {commentaire.fullLocation && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {commentaire.city}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Réaction mobile */}
                          {commentaire.reaction && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg border border-yellow-200">
                              <span className="text-lg">{commentaire.reaction}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Message mobile */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                        {commentaire.message}
                      </p>
                    </div>

                    {/* Infos supplémentaires mobile */}
                    {(commentaire.displayEmail || commentaire.guestPhone) && (
                      <div className="text-xs text-gray-500 mb-3 space-y-1">
                        {commentaire.displayEmail && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {commentaire.displayEmail}
                          </div>
                        )}
                        {commentaire.guestPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {commentaire.guestPhone}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Meta info mobile */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(commentaire.createdAt, true)}
                      </div>
                      <span>#{commentaire.id}</span>
                    </div>

                    {/* Actions mobile - identiques à l'original */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setShowReactionPicker(
                              showReactionPicker === commentaire.id ? null : commentaire.id
                            )
                          }
                          className="border-none emoji-button px-2"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>

                        {showReactionPicker === commentaire.id && (
                          <div className="fixed inset-x-4 bottom-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto emoji-picker">
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-2">Positives</p>
                                <div className="flex flex-wrap gap-1">
                                  {reactions.positive.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReactionClick(commentaire.id, emoji)}
                                      className="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
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
                                      className="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
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
                                      className="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
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
                        <Button size="sm" variant="outline" className="border-none w-full">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(commentaire.id, commentaire.message)}
                        className="text-red-600 hover:text-red-800 border-none hover:bg-red-50 px-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      {commentaire.reaction && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveReaction(commentaire.id)}
                          className="text-orange-600 hover:text-orange-800 border-none hover:bg-orange-50 px-2"
                          title="Supprimer la réaction"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Version desktop */}
                  <div className="hidden sm:block">
                    {/* Header du commentaire */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar ou icône */}
                        <div
                          className={`p-2 rounded-full ${getProviderColor(commentaire.user?.provider)}`}
                        >
                          {getProviderIcon(commentaire.user?.provider)}
                        </div>

                        {/* Info utilisateur */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              {commentaire.displayName}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getCommentTypeColor(commentaire.commentType)}`}
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
                            {commentaire.fullLocation && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                <MapPin className="h-3 w-3 mr-1" />
                                {commentaire.fullLocation}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1 flex-wrap">
                            {commentaire.displayEmail && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {commentaire.displayEmail}
                              </div>
                            )}
                            {commentaire.guestPhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {commentaire.guestPhone}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(commentaire.createdAt)}
                            </div>
                            {commentaire.ipAddress && (
                              <div className="flex items-center gap-1">
                                <Wifi className="h-3 w-3" />
                                {commentaire.ipAddress}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions desktop */}
                      <div className="flex items-center gap-2">
                        {/* Réaction actuelle */}
                        {commentaire.reaction && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg border border-yellow-200">
                            <span className="text-lg">{commentaire.reaction}</span>
                            <button
                              onClick={() => handleRemoveReaction(commentaire.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        {/* Bouton réaction */}
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setShowReactionPicker(
                                showReactionPicker === commentaire.id ? null : commentaire.id
                              )
                            }
                            className="border-none emoji-button"
                          >
                            <Smile className="h-4 w-4" />
                          </Button>

                          {/* Picker d'emojis desktop */}
                          {showReactionPicker === commentaire.id && (
                            <div className="absolute right-0 top-full mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-64 emoji-picker">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-2">
                                    Positives
                                  </p>
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
                                  <p className="text-xs font-medium text-gray-700 mb-2">
                                    Négatives
                                  </p>
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

                        {/* Bouton voir */}
                        <Link href={`/admin/comments/${commentaire.id}`}>
                          <Button size="sm" variant="outline" className="border-none">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        {/* Bouton supprimer */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(commentaire.id, commentaire.message)}
                          className="text-red-600 hover:text-red-800 border-none hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {commentaire.message}
                      </p>
                    </div>

                    {/* Informations techniques supplémentaires */}
                    {(commentaire.userAgent || commentaire.isp || commentaire.organization) && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Informations techniques
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-xs text-blue-800">
                          {commentaire.isp && (
                            <div>
                              <strong>FAI:</strong> {commentaire.isp}
                            </div>
                          )}
                          {commentaire.organization && (
                            <div>
                              <strong>Organisation:</strong> {commentaire.organization}
                            </div>
                          )}
                          {commentaire.timezone && (
                            <div>
                              <strong>Fuseau horaire:</strong> {commentaire.timezone}
                            </div>
                          )}
                          {commentaire.userAgent && (
                            <div className="lg:col-span-2">
                              <strong>User Agent:</strong>
                              <span className="block mt-1 truncate" title={commentaire.userAgent}>
                                {commentaire.userAgent}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Métadonnées */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span>ID: #{commentaire.id}</span>
                        {commentaire.updatedAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Modifié le {formatDate(commentaire.updatedAt)}
                          </div>
                        )}
                        {commentaire.latitude && commentaire.longitude && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {Number(commentaire.latitude).toFixed(4)},{' '}
                            {Number(commentaire.longitude).toFixed(4)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {commentaire.user?.provider && (
                          <div className="flex items-center gap-1">
                            {getProviderIcon(commentaire.user.provider)}
                            <span className="capitalize">{commentaire.user.provider}</span>
                          </div>
                        )}
                        {commentaire.commentType === 'guest' && !commentaire.user && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Visiteur invité</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

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
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {searchTerm || selectedStatus || selectedType || selectedCountry
                  ? 'Aucun commentaire trouvé'
                  : 'Aucun commentaire'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedStatus || selectedType || selectedCountry
                  ? 'Essayez de modifier vos critères de recherche.'
                  : "Les visiteurs n'ont pas encore laissé de commentaires."}
              </p>
              {(searchTerm || selectedStatus || selectedType || selectedCountry) && (
                <div className="mt-6">
                  <Button onClick={handleReset} variant="outline" className="border-none">
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
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
                    <Button variant="outline" size="sm">
                      Précédent
                    </Button>
                  </Link>
                )}
                {commentaires.meta.page < commentaires.meta.lastPage && (
                  <Link
                    href={`/admin/comments?page=${commentaires.meta.page + 1}&search=${searchTerm}&hasReaction=${selectedStatus}&commentType=${selectedType}&country=${selectedCountry}`}
                  >
                    <Button variant="outline" size="sm">
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
