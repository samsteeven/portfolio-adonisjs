import React, { useEffect, useState } from 'react'
import { WhenVisible, Head, Link, router, useForm } from '@inertiajs/react'
import {
  Github,
  Loader2,
  MessageCircle,
  Send,
  Smile,
  X,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  LogIn,
} from 'lucide-react'
import { CommentaireType } from '~/types/commentaire'
import { getInitials } from '~/utils/utils_string'
import { AuthenticatedUser } from '~/types'
import { UserRole } from '~/enums/user_role'
import { Fallback } from '@/components/fallback'
import { PhoneInput } from '@/components/ui/phone-input'
import type { CountryCode } from 'libphonenumber-js'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { toast } from 'sonner'

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
  // Form pour utilisateur authentifié
  const {
    data: authData,
    setData: setAuthData,
    post: postAuth,
    processing: authProcessing,
    errors: authErrors,
    reset: resetAuth,
  } = useForm({
    message: '',
  })

  // Form pour visiteur invité
  const {
    data: guestData,
    setData: setGuestData,
    post: postGuest,
    processing: guestProcessing,
    errors: guestErrors,
    reset: resetGuest,
  } = useForm({
    message: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    website: '', // Honeypot field
  })

  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null)
  const [authLoading, setAuthLoading] = useState<'github' | 'google' | null>(null)
  const [formType, setFormType] = useState<'guest' | 'auth'>('auth')
  const [isclient, setIsClient] = useState(false)
  const [defaultCountry, setDefaultCountry] = useState<CountryCode>('FR')

  useEffect(() => {
    setIsClient(true)

    const fetchCountry = async () => {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipRes.json()

        const countryRes = await fetch(`/whoami?ip=${ipData.ip}`)
        const countryData = await countryRes.json()

        if (countryData && countryData.countryCode) {
          setDefaultCountry(countryData.countryCode)
        }
      } catch (error) {
        console.error('Erreur:', error)
      }
    }

    fetchCountry()
  }, [])

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    postAuth('/guestbook/authenticated', {
      onSuccess: () => {
        resetAuth()
        router.reload({ only: ['comments'] })
      },
    })
  }

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Validate phone number if provided
    if (guestData.guestPhone && !isValidPhoneNumber(guestData.guestPhone, defaultCountry)) {
      toast.error('Erreur lors de la validation du numéro de téléphone')
      return
    }

    postGuest('/guestbook/guest', {
      onSuccess: () => {
        resetGuest()
        router.reload({ only: ['comments'] })
      },
    })
  }

  const formatDate = (dateString: string) => {
    if (!isclient) return '...'
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

  const handleAuthClick = (provider: 'github' | 'google', url: string) => {
    if (authLoading) return

    setAuthLoading(provider)
    window.location.replace(url)
  }

  // Check if user is admin
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

  return (
    <>
      <Head title="Livre d'or - Portfolio" />

      <div className="min-h-screen text-white pt-12">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Rendez votre visite <br />
              <span className="text-pink-500">mémorable !</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl">
              Laissez une impression durable ! Signez mon livre d'or et faites-moi savoir que vous
              êtes passé. Connectez-vous ou laissez vos coordonnées pour partager votre message.
            </p>

            {/* Message de bienvenue pour les utilisateurs connectés */}
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

            {/* Options de connexion pour les non-connectés */}
            {!user?.data && (
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <button
                    onClick={() => setFormType('guest')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      formType === 'guest'
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Laisser un message
                  </button>
                  <button
                    onClick={() => setFormType('auth')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      formType === 'auth'
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </button>
                </div>

                {/* Boutons de connexion sociale */}
                {formType === 'auth' && (
                  <div className="mb-6">
                    <p className="text-white mb-4">Connectez-vous avec :</p>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => handleAuthClick('github', '/oauth/github/redirect')}
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
                        {authLoading === 'github' ? 'Connexion...' : 'GitHub'}
                      </button>

                      <button
                        onClick={() => handleAuthClick('google', '/oauth/google/redirect')}
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
                        {authLoading === 'google' ? 'Connexion...' : 'Google'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formulaire pour utilisateur authentifié */}
          {user?.data && (
            <div className="mb-12">
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <textarea
                  value={authData.message}
                  onChange={(e) => setAuthData('message', e.target.value)}
                  placeholder="Écrivez votre message..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-white placeholder-gray-400"
                />
                {authErrors.message && <p className="text-red-400 text-sm">{authErrors.message}</p>}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={authProcessing || !authData.message.trim()}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      authProcessing || !authData.message.trim()
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-pink-600 hover:bg-pink-500 text-white hover:cursor-pointer'
                    }`}
                  >
                    {authProcessing ? (
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
              </form>
            </div>
          )}

          {/* Formulaire pour visiteur invité */}
          {!user?.data && formType === 'guest' && (
            <div className="mb-12">
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                {/* Honeypot field - caché pour les utilisateurs */}
                <input
                  type="text"
                  name="website"
                  value={guestData.website}
                  onChange={(e) => setGuestData('website', e.target.value)}
                  style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={guestData.guestName}
                      onChange={(e) => setGuestData('guestName', e.target.value)}
                      placeholder="Votre nom complet"
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                    />
                    {guestErrors.guestName && (
                      <p className="text-red-400 text-sm mt-1">{guestErrors.guestName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email (optionnel)
                    </label>
                    <input
                      type="email"
                      value={guestData.guestEmail}
                      onChange={(e) => setGuestData('guestEmail', e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                    />
                    {guestErrors.guestEmail && (
                      <p className="text-red-400 text-sm mt-1">{guestErrors.guestEmail}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Téléphone (optionnel)
                  </label>
                  <PhoneInput
                    value={guestData.guestPhone}
                    onChange={(value) => setGuestData('guestPhone', value || '')}
                    placeholder="Entrez votre numéro de téléphone"
                    defaultCountry={defaultCountry}
                    international
                    className="w-full [&_input]:px-4 [&_input]:py-3 [&_input]:bg-gray-800 [&_input]:border-gray-700 [&_input]:text-white [&_input]:placeholder-gray-400 [&_input]:focus:ring-2 [&_input]:focus:ring-pink-500 [&_input]:focus:border-transparent [&_input]:rounded-lg [&_button]:bg-gray-800 [&_button]:border-gray-700 [&_button]:hover:bg-gray-700"
                  />
                  {guestErrors.guestPhone && (
                    <p className="text-red-400 text-sm mt-1">{guestErrors.guestPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Votre message *
                  </label>
                  <textarea
                    value={guestData.message}
                    onChange={(e) => setGuestData('message', e.target.value)}
                    placeholder="Laissez-moi un message..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-white placeholder-gray-400"
                  />
                  {guestErrors.message && (
                    <p className="text-red-400 text-sm mt-1">{guestErrors.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      guestProcessing || !guestData.message.trim() || !guestData.guestName.trim()
                    }
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      guestProcessing || !guestData.message.trim() || !guestData.guestName.trim()
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-pink-600 hover:bg-pink-500 text-white hover:cursor-pointer'
                    }`}
                  >
                    {guestProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste des commentaires avec Deferred */}
          <WhenVisible data="comments" fallback={<Fallback message="messages" />}>
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
                            alt={comment.displayName || comment.user.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {getInitials(comment.displayName || comment.guestName || 'V')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Contenu du commentaire */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {comment.displayName || comment.guestName}
                            </span>
                            {comment.commentType === 'guest' && (
                              <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                                Visiteur
                              </span>
                            )}
                            {comment.user?.provider && (
                              <span className="text-xs text-gray-500">
                                (via {comment.user.provider})
                              </span>
                            )}
                            {comment.fullLocation && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {comment.fullLocation}
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

                        <p className="text-gray-300 mb-2 whitespace-pre-wrap">{comment.message}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <time className="flex items-center gap-1" dateTime={comment.createdAt}>
                            <Calendar className="w-3 h-3" />
                            {formatDate(comment.createdAt)}
                          </time>
                          {comment.country && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {comment.city && `${comment.city}, `}
                              {comment.country}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Message si aucun commentaire */}
                  {(!comments?.data || comments.data.length === 0) && (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Aucun message pour le moment.</p>
                      <p className="text-gray-500 text-sm">
                        Soyez le premier à signer ce livre d'or !
                      </p>
                    </div>
                  )}
                </div>
              )
            }}
          </WhenVisible>
        </div>
      </div>
    </>
  )
}
