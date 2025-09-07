import { Link, router } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  Trash2,
  Github,
  Chrome,
  UserCheck,
  UserX,
  Smile,
  X,
  Copy,
  ExternalLink,
  MessageCircle,
  Eye,
  Globe,
} from 'lucide-react'
import { CommentaireType } from '~/types/commentaire'
import { toast } from 'sonner'

interface Props {
  commentaire: CommentaireType
  reactions: {
    positive: string[]
    neutral: string[]
    negative: string[]
  }
}

export default function ShowComment({ commentaire, reactions }: Props) {
  const [isClient, setIsClient] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  // État pour le modal de suppression
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
    if (!isClient) return '...'
    return new Date(dateString).toLocaleDateString('fr-FR', options)
  }

  const handleDeleteClick = () => {
    setDeleteModal({
      isOpen: true,
      isLoading: false,
    })
  }

  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, isLoading: true }))

    router.delete(`/admin/comments/${commentaire.id}`, {
      onSuccess: () => {
        toast.success('Commentaire supprimé avec succès')
        router.visit('/admin/comments')
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
      isLoading: false,
    })
  }

  const handleReactionClick = async (emoji: string) => {
    setShowReactionPicker(false)

    router.patch(
      `/admin/comments/${commentaire.id}/reaction`,
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

  const handleRemoveReaction = async () => {
    router.patch(
      `/admin/comments/${commentaire.id}/reaction`,
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copié dans le presse-papier')
    } catch (error) {
      toast.error('Erreur lors de la copie')
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github':
        return <Github className="h-5 w-5" />
      case 'google':
        return <Chrome className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'github':
        return 'text-gray-700 bg-gray-100 border-gray-200'
      case 'google':
        return 'text-blue-700 bg-blue-100 border-blue-200'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'github':
        return 'GitHub'
      case 'google':
        return 'Google'
      default:
        return 'Local'
    }
  }

  return (
    <>
      <div className="min-h-screen sm:bg-gray-50 sm:p-3">
        <div className="px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href={'/admin/comments'}
                className="inline-flex items-center text-base text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour aux commentaires
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Détail du commentaire
                </h1>
                <p className="text-gray-600">
                  Commentaire #{commentaire.id} par{' '}
                  <span className="font-semibold text-gray-900">{commentaire.user?.username}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Posté le{' '}
                  {formatDate(commentaire.createdAt, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {commentaire.updatedAt && (
                    <span>
                      {' • Modifié le '}
                      {formatDate(commentaire.updatedAt, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </p>
              </div>

              {/* Actions principales */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Réaction actuelle */}
                {commentaire.reaction && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="text-2xl">{commentaire.reaction}</span>
                    <button
                      onClick={handleRemoveReaction}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Supprimer la réaction"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Bouton réaction */}
                <div className="relative">
                  <Button
                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                    variant="outline"
                    className="border-none"
                    size="sm"
                  >
                    <Smile className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">
                      {commentaire.reaction ? 'Changer' : 'Réagir'}
                    </span>
                  </Button>

                  {/* Picker d'emojis */}
                  {showReactionPicker && (
                    <div className="absolute right-0 top-full mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-72">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Réactions positives
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {reactions.positive.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReactionClick(emoji)}
                                className="p-2 hover:bg-gray-100 rounded text-xl transition-colors"
                                title={`Réagir avec ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Réactions neutres
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {reactions.neutral.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReactionClick(emoji)}
                                className="p-2 hover:bg-gray-100 rounded text-xl transition-colors"
                                title={`Réagir avec ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Réactions négatives
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {reactions.negative.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReactionClick(emoji)}
                                className="p-2 hover:bg-gray-100 rounded text-xl transition-colors"
                                title={`Réagir avec ${emoji}`}
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

                <Button
                  onClick={handleDeleteClick}
                  variant="outline"
                  className="text-red-600 hover:text-red-800 border-none hover:bg-red-50"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Supprimer</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Message du commentaire */}
              <Card className="bg-white">
                <div className="p-4 sm:p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Message
                  </h2>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                      {commentaire.message}
                    </p>
                  </div>

                  {/* Statistiques du message */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">
                        {commentaire.message.length}
                      </div>
                      <div className="text-xs text-blue-800">Caractères</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">
                        {commentaire.message.split(' ').length}
                      </div>
                      <div className="text-xs text-green-800">Mots</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg col-span-2 sm:col-span-1">
                      <div className="text-lg font-semibold text-purple-600">
                        {commentaire.message.split('\n').length}
                      </div>
                      <div className="text-xs text-purple-800">Lignes</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Aperçu public */}
              <Card className="bg-white">
                <div className="p-4 sm:p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Aperçu public
                  </h2>

                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className={`p-2 rounded-full ${getProviderColor(commentaire.user?.provider || 'local')}`}
                      >
                        {getProviderIcon(commentaire.user?.provider || 'local')}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {commentaire.user?.username}
                          </span>
                          {commentaire.reaction && (
                            <span className="text-lg" title="Réaction de l'admin">
                              {commentaire.reaction}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                          {commentaire.message}
                        </p>

                        <div className="text-xs text-gray-500">
                          {formatDate(commentaire.createdAt, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-3">
                    C'est ainsi que ce commentaire apparaîtra sur votre portfolio public.
                  </p>
                </div>
              </Card>

              {/* Historique des modifications (si applicable) */}
              {commentaire.updatedAt && (
                <Card className="bg-white">
                  <div className="p-4 sm:p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Historique
                    </h2>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="p-1 bg-blue-100 rounded">
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">Commentaire créé</p>
                          <p className="text-xs text-blue-600">
                            {formatDate(commentaire.createdAt, {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="p-1 bg-green-100 rounded">
                          <Clock className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900">
                            Dernière modification
                          </p>
                          <p className="text-xs text-green-600">
                            {formatDate(commentaire.updatedAt, {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Informations utilisateur */}
              <Card className="p-4 sm:p-6 bg-white">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations utilisateur
                </h3>

                <div className="space-y-4">
                  {/* Statut de connexion */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    {commentaire.user ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">
                          Utilisateur connecté
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <UserX className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700 font-medium">
                          Utilisateur anonyme
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 font-medium flex-1 truncate">
                        {commentaire.user?.username}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(commentaire.user?.username!)}
                        className="h-6 w-6 p-0 border-none flex-shrink-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 font-medium flex-1 truncate">
                        {commentaire.user?.email}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(commentaire.user?.email)}
                        className="h-6 w-6 p-0 border-none flex-shrink-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <a
                        href={`mailto:${commentaire.user?.email}`}
                        className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* Fournisseur d'authentification */}
                  {commentaire.user?.provider && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fournisseur d'authentification
                      </label>
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getProviderColor(commentaire.user.provider)}`}
                      >
                        {getProviderIcon(commentaire.user.provider)}
                        <span className="text-sm font-medium">
                          {getProviderName(commentaire.user.provider)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ID utilisateur */}
                  {commentaire.userId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID utilisateur
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                          #{commentaire.userId}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(commentaire.userId?.toString() || '')}
                          className="h-6 w-6 p-0 border-none"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Métadonnées */}
              <Card className="p-4 sm:p-6 bg-white">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Métadonnées</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID du commentaire
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        #{commentaire.id}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(commentaire.id.toString())}
                        className="h-6 w-6 p-0 border-none"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de création
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        {formatDate(commentaire.createdAt, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {commentaire.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dernière modification
                      </label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600">
                          {formatDate(commentaire.updatedAt, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {isClient && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ancienneté
                      </label>
                      <div className="text-sm text-gray-600">
                        {Math.floor(
                          (Date.now() - new Date(commentaire.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        jour(s)
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Réaction actuelle
                    </label>
                    <div className="text-sm text-gray-600">
                      {commentaire.reaction ? (
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{commentaire.reaction}</span>
                          <span>Réaction ajoutée</span>
                        </span>
                      ) : (
                        'Aucune réaction'
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Actions rapides */}
              <Card className="p-4 sm:p-6 bg-white">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>

                <div className="space-y-3">
                  <Button
                    onClick={() => copyToClipboard(window.location.href)}
                    variant="outline"
                    className="w-full justify-start border-none"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier le lien
                  </Button>

                  <Button
                    onClick={() => copyToClipboard(commentaire.message)}
                    variant="outline"
                    className="w-full justify-start border-none"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier le message
                  </Button>

                  {commentaire.user?.email && (
                    <a href={`mailto:${commentaire.user?.email}`} className="block w-full">
                      <Button variant="outline" className="w-full justify-start border-none">
                        <Mail className="h-4 w-4 mr-2" />
                        Contacter par email
                      </Button>
                    </a>
                  )}

                  <Button
                    onClick={() => window.open('/', '_blank')}
                    variant="outline"
                    className="w-full justify-start border-none"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir sur le site
                  </Button>

                  <hr className="my-2" />

                  <Button
                    onClick={handleDeleteClick}
                    variant="outline"
                    className="w-full justify-start border-none text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer ce commentaire
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le commentaire"
        message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce commentaire ?"
        itemName={`Commentaire de ${commentaire.user?.username}`}
        isLoading={deleteModal.isLoading}
      />

      {/* Overlay pour fermer le picker d'emojis */}
      {showReactionPicker && (
        <div className="fixed inset-0 z-0" onClick={() => setShowReactionPicker(false)} />
      )}
    </>
  )
}

ShowComment.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Détail commentaire"
    description="Voir les détails d'un commentaire"
    currentPath="/admin/comments"
  >
    {page}
  </AdminLayout>
)
