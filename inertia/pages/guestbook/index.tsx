import React, { useEffect, useState } from 'react'
import { Deferred, Head, Link, router, useForm } from '@inertiajs/react'
import { Github, Loader2, MessageCircle, Send, Smile, X } from 'lucide-react'
import { CommentaireType } from '~/types/commentaire'
import { getInitials } from '~/utils/utils_string'
import { AuthenticatedUser } from '~/types'
import { UserRole } from '~/enums/user_role'

interface CommentsData {
  data: CommentaireType[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface GuestbookProps {
  comments: CommentsData
  reactions: {
    positive: string[]
    neutral: string[]
    negative: string[]
  }
  user?: {
    data: AuthenticatedUser | undefined
    guard: string | null
  }
}

export default function Guestbook({ comments: deferredComments, reactions, user }: GuestbookProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    message: '',
  })
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null)
  const [authLoading, setAuthLoading] = useState<'github' | 'google' | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/guestbook', {
      onSuccess: () => {
        reset()
        router.reload({ only: ['comments'] })
      },
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
          console.error("Erreur lors de l'ajout de la réaction")
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
          console.error('Erreur lors de la suppression de la réaction')
        },
      }
    )
  }

  // Gestion des clics sur les boutons d'authentification
  const handleAuthClick = (provider: 'github' | 'google', url: string) => {
    if (authLoading) return // Empêche les clics multiples

    setAuthLoading(provider)

    // Redirection vers l'URL d'authentification
    window.location.replace(url)
  }

  // Check if user is admin (adjust role check according to your role system)
  const isAdmin = user?.data && user.data.role === UserRole.ADMIN

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

  // Réinitialiser l'état de chargement si on revient sur la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setAuthLoading(null)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return (
    <>
      <Head title="Livre d'or - Portfolio" />

      <div className="min-h-screen bg-gray-900 text-white pt-12">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Rendez votre visite <br />
              <span className="text-pink-500">mémorable !</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl">
              Laissez une impression durable ! Signez mon livre d'or et faites-moi savoir que vous
              êtes passé.
            </p>

            {/* Show login buttons only if user is not authenticated */}
            {!user?.data && (
              <div className="mb-8">
                <p className="text-white mb-4">Connectez-vous pour laisser un message !</p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => handleAuthClick('github', 'oauth/github/redirect')}
                    disabled={authLoading !== null}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-colors ${
                      authLoading !== null
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-800 hover:bg-gray-700 text-white hover:cursor-pointer'
                    }`}
                  >
                    {authLoading === 'github' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Github className="w-5 h-5" />
                    )}
                    {authLoading === 'github' ? 'Connexion...' : 'Connectez-vous avec GitHub'}
                  </button>

                  <button
                    onClick={() => handleAuthClick('google', 'oauth/google/redirect')}
                    disabled={authLoading !== null}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-colors ${
                      authLoading !== null
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-800 hover:bg-gray-700 text-white hover:cursor-pointer'
                    }`}
                  >
                    {authLoading === 'google' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    {authLoading === 'google' ? 'Connexion...' : 'Connectez-vous avec Google'}
                  </button>
                </div>
              </div>
            )}

            {/* Welcome message for authenticated users */}
            {user?.data && (
              <div className="mb-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-green-400 mb-2">✨ Bienvenue, {user.data.username} !</p>
                <p className="text-gray-400 text-sm">
                  Vous êtes connecté et pouvez maintenant laisser un message.
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <Link
                    href={user.guard === 'web' ? '/admin/auth/logout' : '/auth/guestbook/logout'}
                    method="post"
                    replace
                    className="text-sm text-gray-400 hover:text-white transition-colors hover:cursor-pointer"
                  >
                    Se déconnecter
                  </Link>
                  {isAdmin && (
                    <span className="text-xs bg-pink-600 px-2 py-1 rounded text-white">Admin</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Formulaire de commentaire - affiché seulement si connecté */}
          {user?.data && (
            <div className="mb-12">
              <div className="space-y-4">
                <textarea
                  value={data.message}
                  onChange={(e) => setData('message', e.target.value)}
                  placeholder="Écrivez votre message..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border-none border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-white placeholder-gray-400"
                />
                {errors.message && <p className="text-red-400 text-sm">{errors.message}</p>}

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={processing || !data.message.trim()}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      processing || !data.message.trim()
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-pink-600 hover:bg-pink-500 text-white hover:cursor-pointer'
                    }`}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Publication...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Publier
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Liste des commentaires avec Deferred */}
          <Deferred
            data="comments"
            fallback={
              <div className="flex justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                  <span className="text-gray-400">Chargement des messages...</span>
                </div>
              </div>
            }
          >
            {() => {
              const comments = deferredComments as CommentsData
              return (
                <div className="space-y-6">
                  {comments?.data?.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-4 group">
                      {/* Avatar ou initiales */}
                      <div className="flex-shrink-0">
                        {comment.user?.subInfo ? (
                          <img
                            src={comment.user.subInfo.photoPath}
                            alt={comment.user.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {getInitials(comment.user.username)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Contenu du commentaire */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {comment.user.username}
                            </span>
                            {comment.user?.provider && (
                              <span className="text-xs text-gray-500">
                                (via {comment.user.provider})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Current reaction with remove button */}
                            {comment.reaction && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded border border-gray-700">
                                <span className="text-lg">{comment.reaction}</span>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleRemoveReaction(comment.id)}
                                    className="text-gray-400 hover:text-red-400 transition-colors"
                                    title="Supprimer la réaction"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Add reaction button */}
                            {isAdmin && (
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setShowReactionPicker(
                                      showReactionPicker === comment.id ? null : comment.id
                                    )
                                  }
                                  className="emoji-button p-1 text-gray-400 hover:text-pink-400 transition-colors"
                                  title="Ajouter une réaction"
                                >
                                  <Smile className="w-4 h-4" />
                                </button>

                                {/* Picker d'emojis */}
                                {showReactionPicker === comment.id && (
                                  <div className="absolute right-0 top-full mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 w-64 emoji-picker">
                                    <div className="space-y-3">
                                      <div>
                                        <p className="text-xs font-medium text-gray-400 mb-2">
                                          Positives
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {reactions.positive.map((emoji) => (
                                            <button
                                              key={emoji}
                                              onClick={() => handleReactionClick(comment.id, emoji)}
                                              className="p-1 hover:bg-gray-700 rounded text-lg transition-colors"
                                            >
                                              {emoji}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <p className="text-xs font-medium text-gray-400 mb-2">
                                          Neutres
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {reactions.neutral.map((emoji) => (
                                            <button
                                              key={emoji}
                                              onClick={() => handleReactionClick(comment.id, emoji)}
                                              className="p-1 hover:bg-gray-700 rounded text-lg transition-colors"
                                            >
                                              {emoji}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <p className="text-xs font-medium text-gray-400 mb-2">
                                          Négatives
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {reactions.negative.map((emoji) => (
                                            <button
                                              key={emoji}
                                              onClick={() => handleReactionClick(comment.id, emoji)}
                                              className="p-1 hover:bg-gray-700 rounded text-lg transition-colors"
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
                            )}
                          </div>
                        </div>

                        <p className="text-gray-300 mb-2 whitespace-pre-wrap">
                          {comment.message}
                          {comment.reaction && !isAdmin && (
                            <span className="ml-2 text-lg">{comment.reaction}</span>
                          )}
                        </p>

                        <time className="text-sm text-gray-500 italic" dateTime={comment.createdAt}>
                          {formatDate(comment.createdAt)}
                        </time>
                      </div>
                    </div>
                  ))}

                  {/* Message si aucun commentaire */}
                  {(!comments?.data || comments.data.length === 0) && (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Aucun message pour le moment.</p>
                      <p className="text-gray-500 text-sm">
                        {user
                          ? "Soyez le premier à signer ce livre d'or !"
                          : "Connectez-vous pour être le premier à signer ce livre d'or !"}
                      </p>
                    </div>
                  )}
                </div>
              )
            }}
          </Deferred>
        </div>
      </div>
    </>
  )
}
