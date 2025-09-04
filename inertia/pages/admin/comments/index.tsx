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
  UserX,
  Smile,
  X,
  ExternalLink,
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
  }
}

export default function CommentsIndex({ commentaires, reactions, filters = {} }: Props) {
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [filteredComments, setFilteredComments] = useState<CommentaireType[]>(commentaires.data)

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const [selectedStatus, setSelectedStatus] = useState(filters.hasReaction || '')

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
          (c.user?.username || c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.user?.email || c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.message || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus) {
      if (selectedStatus === 'true') {
        results = results.filter((c) => !!c.reaction)
      } else if (selectedStatus === 'false') {
        results = results.filter((c) => !c.reaction)
      }
    }

    setFilteredComments(results)
  }, [searchTerm, selectedStatus, commentaires.data])

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

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github':
        return <Github className="h-4 w-4" />
      case 'google':
        return <Chrome className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'github':
        return 'text-gray-700 bg-gray-100'
      case 'google':
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

  return (
    <>
      <div className="min-h-screen sm:bg-gray-50 sm:p-3">
        <div className="px-3 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
            <div className="flex-auto mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Commentaires</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-700">
                Gérez les commentaires et réactions de votre portfolio
              </p>
              <div className="mt-2 text-sm text-gray-500">
                {filteredComments.length} commentaire(s) affiché(s)
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button variant="outline" className="border-none w-full sm:w-auto">
                <ExternalLink className="h-3 w-3 mr-2" />
                <span className="sm:inline">Voir la section</span>
              </Button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Total</p>
                  <p className="text-lg sm:text-xl font-semibold">{commentaires.meta.total}</p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smile className="h-4 sm:h-5 w-4 sm:w-5 text-green-600" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Avec réaction</p>
                  <p className="text-lg sm:text-xl font-semibold">
                    {commentaires.data.filter((c) => c.reaction).length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-600" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">En attente</p>
                  <p className="text-lg sm:text-xl font-semibold">
                    {commentaires.data.filter((c) => !c.reaction).length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserCheck className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Utilisateurs</p>
                  <p className="text-lg sm:text-xl font-semibold">
                    {new Set(commentaires.data.map((c) => c.userId || c.email)).size}
                  </p>
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
                    placeholder="Nom, email ou message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Statut de réaction */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Réactions</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tous</option>
                    <option value="true">Avec réaction</option>
                    <option value="false">Sans réaction</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="border-none w-full sm:w-auto"
                  >
                    <Filter className="h-4 w-4 mr-2 sm:mr-0" />
                    <span className="sm:hidden">Réinitialiser</span>
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
                        className={`p-2 rounded-full flex-shrink-0 ${getProviderColor(commentaire.user?.provider || 'local')}`}
                      >
                        {getProviderIcon(commentaire.user?.provider || 'local')}
                      </div>

                      {/* Info utilisateur */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {commentaire.user?.username || commentaire.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {commentaire.user ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Connecté
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                  <UserX className="h-3 w-3 mr-1" />
                                  Anonyme
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

                    {/* Meta info mobile */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(commentaire.createdAt, true)}
                      </div>
                      <span>#{commentaire.id}</span>
                    </div>

                    {/* Actions mobile */}
                    <div className="flex items-center gap-2">
                      {/* Bouton réaction mobile */}
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

                        {/* Picker d'emojis mobile */}
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
                          className={`p-2 rounded-full ${getProviderColor(commentaire.user?.provider || 'local')}`}
                        >
                          {getProviderIcon(commentaire.user?.provider || 'local')}
                        </div>

                        {/* Info utilisateur */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {commentaire.user?.username || commentaire.name}
                            </h3>
                            {commentaire.user ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Connecté
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                <UserX className="h-3 w-3 mr-1" />
                                Anonyme
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {commentaire.user?.email || commentaire.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(commentaire.createdAt)}
                            </div>
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
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {commentaire.message}
                      </p>
                    </div>

                    {/* Métadonnées */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <span>ID: #{commentaire.id}</span>
                        {commentaire.updatedAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Modifié le {formatDate(commentaire.updatedAt)}
                          </div>
                        )}
                      </div>

                      {commentaire.user?.provider && (
                        <div className="flex items-center gap-1">
                          {getProviderIcon(commentaire.user.provider)}
                          <span className="capitalize">{commentaire.user.provider}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredComments.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {searchTerm || selectedStatus ? 'Aucun commentaire trouvé' : 'Aucun commentaire'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedStatus
                  ? 'Essayez de modifier vos critères de recherche.'
                  : "Les visiteurs n'ont pas encore laissé de commentaires."}
              </p>
              {(searchTerm || selectedStatus) && (
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
                    href={`/admin/commentaires?page=${commentaires.meta.page - 1}&search=${searchTerm}&hasReaction=${selectedStatus}`}
                  >
                    <Button variant="outline" size="sm">
                      Précédent
                    </Button>
                  </Link>
                )}
                {commentaires.meta.page < commentaires.meta.lastPage && (
                  <Link
                    href={`/admin/comments?page=${commentaires.meta.page + 1}&search=${searchTerm}&hasReaction=${selectedStatus}`}
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
    description="Gestion des commentaires"
    currentPath="/admin/comments"
  >
    {page}
  </AdminLayout>
)
