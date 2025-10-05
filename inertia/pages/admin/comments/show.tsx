import { Link, router } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ConfirmationModal from '~/components/ConfirmationModal'
import {
  ArrowLeft,
  User,
  Mail,
  Trash2,
  Github,
  Chrome,
  UserCheck,
  Smile,
  X,
  Copy,
  ExternalLink,
  MessageCircle,
  Eye,
  MapPin,
  Phone,
  Shield,
  Wifi,
  Monitor,
} from 'lucide-react'
import { CommentaireType } from '~/types/commentaire'
import { toast } from 'sonner'
import { formatLocalDate } from '~/utils/utils_string'

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

  const handleDeleteClick = () => {
    setDeleteModal({
      isOpen: true,
      isLoading: false,
    })
  }

  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, isLoading: true }))

    router.delete(`/admin/comments/${commentaire.id}`, {
      onError: () => {
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

  const getProviderIcon = (provider?: string) => {
    switch (provider) {
      case 'github':
        return <Github className="h-5 w-5" />
      case 'google':
        return <Chrome className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  const getProviderColor = (provider?: string) => {
    switch (provider) {
      case 'github':
        return 'text-gray-700 bg-gray-100 border-gray-200'
      case 'google':
        return 'text-blue-700 bg-blue-100 border-blue-200'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getProviderName = (provider?: string) => {
    switch (provider) {
      case 'github':
        return 'GitHub'
      case 'google':
        return 'Google'
      default:
        return 'Local'
    }
  }

  const isGuestComment = commentaire.commentType === 'guest'

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
                  <span className="font-semibold text-gray-900">{commentaire.displayName}</span>
                  {isGuestComment && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      <User className="h-3 w-3 mr-1" />
                      Invité
                    </span>
                  )}
                  {!isGuestComment && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Connecté
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Posté le {isClient && formatLocalDate(commentaire.createdAt)}
                  {commentaire.updatedAt && (
                    <span>
                      {' • Modifié le '}
                      {isClient && formatLocalDate(commentaire.updatedAt)}
                    </span>
                  )}
                  {commentaire.fullLocation && (
                    <span className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {commentaire.fullLocation}
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
                    <>
                      {/* Version mobile */}
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 sm:hidden">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg w-full max-w-sm max-h-[80vh] overflow-y-auto emoji-picker">
                          <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Choisir une réaction</h3>
                            <button
                              onClick={() => setShowReactionPicker(false)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="p-4 space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Réactions positives
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {reactions.positive.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReactionClick(emoji)}
                                    className="p-2 hover:bg-gray-100 rounded text-2xl transition-colors"
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
                                    className="p-2 hover:bg-gray-100 rounded text-2xl transition-colors"
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

                      {/* Version desktop (dropdown) */}
                      <div className="hidden sm:block absolute right-0 top-full mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-72 emoji-picker">
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
                    </>
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

              {/* Informations techniques et de géolocalisation */}
              {(commentaire.ipAddress ||
                commentaire.userAgent ||
                commentaire.country ||
                commentaire.isp ||
                commentaire.organization ||
                commentaire.timezone) && (
                <Card className="bg-white">
                  <div className="p-4 sm:p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Informations techniques
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Géolocalisation */}
                      {(commentaire.country || commentaire.city || commentaire.latitude) && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Localisation
                          </h3>

                          {commentaire.country && (
                            <div className="text-sm">
                              <span className="text-gray-600">Pays:</span>
                              <span className="ml-2 font-medium">
                                {commentaire.country}
                                {commentaire.countryCode && (
                                  <span className="ml-1 text-xs text-gray-500 uppercase">
                                    ({commentaire.countryCode})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}

                          {commentaire.city && (
                            <div className="text-sm">
                              <span className="text-gray-600">Ville:</span>
                              <span className="ml-2 font-medium">{commentaire.city}</span>
                            </div>
                          )}

                          {commentaire.regionName && (
                            <div className="text-sm">
                              <span className="text-gray-600">Région:</span>
                              <span className="ml-2 font-medium">{commentaire.regionName}</span>
                            </div>
                          )}

                          {commentaire.timezone && (
                            <div className="text-sm">
                              <span className="text-gray-600">Fuseau horaire:</span>
                              <span className="ml-2 font-medium">{commentaire.timezone}</span>
                            </div>
                          )}

                          {commentaire.latitude && commentaire.longitude && (
                            <div className="text-sm">
                              <span className="text-gray-600">Coordonnées:</span>
                              <span className="ml-2 font-mono text-xs">
                                {Number(commentaire.latitude).toFixed(4)},{' '}
                                {Number(commentaire.longitude).toFixed(4)}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  copyToClipboard(
                                    `${commentaire.latitude}, ${commentaire.longitude}`
                                  )
                                }
                                className="ml-2 h-5 w-5 p-0 border-none"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Informations réseau */}
                      {(commentaire.ipAddress || commentaire.isp || commentaire.organization) && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Wifi className="h-4 w-4" />
                            Réseau
                          </h3>

                          {commentaire.ipAddress && (
                            <div className="text-sm">
                              <span className="text-gray-600">IP (anonymisée):</span>
                              <span className="ml-2 font-mono text-xs">
                                {commentaire.ipAddress}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(commentaire.ipAddress || '')}
                                className="ml-2 h-5 w-5 p-0 border-none"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}

                          {commentaire.isp && (
                            <div className="text-sm">
                              <span className="text-gray-600">FAI:</span>
                              <span className="ml-2 font-medium">{commentaire.isp}</span>
                            </div>
                          )}

                          {commentaire.organization && (
                            <div className="text-sm">
                              <span className="text-gray-600">Organisation:</span>
                              <span className="ml-2 font-medium">{commentaire.organization}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* User Agent */}
                    {commentaire.userAgent && (
                      <div className="mt-6 pt-4 border-t">
                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                          <Monitor className="h-4 w-4" />
                          Navigateur / Système
                        </h3>
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-xs text-gray-600 font-mono break-all leading-relaxed">
                            {commentaire.userAgent}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(commentaire.userAgent || '')}
                          className="mt-2 border-none"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copier User Agent
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Informations utilisateur */}
              <Card className="p-4 sm:p-6 bg-white">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isGuestComment ? 'Informations visiteur' : 'Informations utilisateur'}
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
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-800 font-medium">Visiteur invité</span>
                      </div>
                    )}
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 font-medium flex-1 truncate">
                        {commentaire.displayName}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(commentaire.displayName || '')}
                        className="h-6 w-6 p-0 border-none flex-shrink-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Email */}
                  {commentaire.displayEmail && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 font-medium flex-1 truncate">
                          {commentaire.displayEmail}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(commentaire.displayEmail || '')}
                          className="h-6 w-6 p-0 border-none flex-shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <a
                          href={`mailto:${commentaire.displayEmail}`}
                          className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Téléphone (pour les invités) */}
                  {commentaire.guestPhone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 font-medium flex-1 truncate">
                          {commentaire.guestPhone}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(commentaire.guestPhone || '')}
                          className="h-6 w-6 p-0 border-none flex-shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <a
                          href={`tel:${commentaire.guestPhone}`}
                          className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                        >
                          <Phone className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}

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

                  {/* Type de commentaire */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de commentaire
                    </label>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${
                        commentaire.commentType === 'authenticated'
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-blue-50 border-blue-200 text-blue-800'
                      }`}
                    >
                      {commentaire.commentType === 'authenticated' ? (
                        <>
                          <UserCheck className="h-4 w-4" />
                          Utilisateur connecté
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4" />
                          Visiteur invité
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Actions rapides */}
              <Card className="p-4 sm:p-6 bg-white">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>

                <div className="space-y-3">
                  {commentaire.displayEmail && (
                    <a href={`mailto:${commentaire.displayEmail}`} className="block w-full">
                      <Button variant="outline" className="w-full justify-start border-none">
                        <Mail className="h-4 w-4 mr-2" />
                        Contacter par email
                      </Button>
                    </a>
                  )}

                  {commentaire.guestPhone && (
                    <a href={`tel:${commentaire.guestPhone}`} className="block w-full">
                      <Button variant="outline" className="w-full justify-start border-none">
                        <Phone className="h-4 w-4 mr-2" />
                        Appeler
                      </Button>
                    </a>
                  )}

                  {/* Localiser sur une carte */}
                  {commentaire.latitude && commentaire.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${commentaire.latitude},${commentaire.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button variant="outline" className="w-full justify-start border-none">
                        <MapPin className="h-4 w-4 mr-2" />
                        Voir sur la carte
                      </Button>
                    </a>
                  )}

                  <Button
                    onClick={() => window.open('/guestbook', '_blank')}
                    variant="outline"
                    className="w-full justify-start border-none"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir le livre d'or
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
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le commentaire"
        message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce commentaire ?"
        itemName={`Commentaire de ${commentaire.displayName}`}
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
