import React, { useEffect, useState } from 'react'
import { WhenVisible, Head, Link, router, useForm, usePage } from '@inertiajs/react'
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
  LogIn,
} from 'lucide-react'
import { CommentaireType } from '~/types/commentaire'
import { getInitials } from '~/utils/utils_string'
import { AuthenticatedUser, InertiaProps } from '~/types'
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
    website: '',
  })

  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null)
  const [authLoading, setAuthLoading] = useState<'github' | 'google' | null>(null)
  const [formType, setFormType] = useState<'guest' | 'auth'>('auth')
  const [isclient, setIsClient] = useState(false)
  const [defaultCountry, setDefaultCountry] = useState<CountryCode>('CM')
  const { auth } = usePage<InertiaProps>().props

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!auth?.user) {
      const fetchCountry = async () => {
        try {
          const response = await fetch('https://ipapi.co/json/')
          const data = await response.json()
          if (data && data.country_code) {
            setDefaultCountry(data.country_code)
          }
        } catch (error) {
          console.error('Failed to fetch country:', error)
        }
      }
      fetchCountry()
    }
  }, [auth?.user])

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
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleReactionClick = async (commentaireId: number, emoji: string) => {
    setShowReactionPicker(null)
    router.patch(
      `/admin/comments/${commentaireId}/reaction`,
      { reaction: emoji },
      {
        preserveScroll: true,
        onError: () => console.error("Erreur lors de l'ajout de la réaction"),
      }
    )
  }

  const handleRemoveReaction = async (commentaireId: number) => {
    router.patch(
      `/admin/comments/${commentaireId}/reaction`,
      { reaction: null },
      {
        preserveScroll: true,
        onError: () => console.error('Erreur lors de la suppression de la réaction'),
      }
    )
  }

  const handleAuthClick = (provider: 'github' | 'google', url: string) => {
    if (authLoading) return
    setAuthLoading(provider)
    window.location.replace(url)
  }

  const isAdmin = user?.data && user.data.role === UserRole.ADMIN

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

      <div className="min-h-screen text-white pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
              Rendez votre visite <br className="hidden sm:block" />
              <span className="text-pink-500">mémorable !</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8">
              Laissez une impression durable ! Signez mon livre d'or et faites-moi savoir que vous
              êtes passé.
            </p>

            {/* Message de bienvenue */}
            {user?.data && (
              <div className="mb-6 sm:mb-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-green-400 mb-2 text-sm sm:text-base">
                  ✨ Bienvenue, {user.data.username} !
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Vous êtes connecté et pouvez maintenant laisser un message.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link
                    href={user.guard === 'web' ? '/admin/auth/logout' : '/auth/guestbook/logout'}
                    method="post"
                    replace
                    className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Se déconnecter
                  </Link>
                  {isAdmin && (
                    <span className="text-xs bg-pink-600 px-2 py-1 rounded text-white">Admin</span>
                  )}
                </div>
              </div>
            )}

            {/* Options de connexion */}
            {!user?.data && (
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <button
                    onClick={() => setFormType('guest')}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
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
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
                      formType === 'auth'
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </button>
                </div>

                {/* Boutons OAuth */}
                {formType === 'auth' && (
                  <div className="mb-6">
                    <p className="text-white mb-4 text-sm sm:text-base">Connectez-vous avec :</p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <button
                        onClick={() => handleAuthClick('github', '/oauth/github/redirect')}
                        disabled={authLoading !== null}
                        className={`flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                          authLoading !== null
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
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
                        className={`flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                          authLoading !== null
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
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

          {/* Formulaire authentifié */}
          {user?.data && (
            <div className="mb-8 sm:mb-12">
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <textarea
                  value={authData.message}
                  onChange={(e) => setAuthData('message', e.target.value)}
                  placeholder="Écrivez votre message..."
                  rows={4}
                  className="w-full px-4 py-3 border bg-gray-800 border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-white placeholder-gray-400 text-sm sm:text-base"
                />
                {authErrors.message && <p className="text-red-400 text-sm">{authErrors.message}</p>}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={authProcessing || !authData.message.trim()}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                      authProcessing || !authData.message.trim()
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-pink-600 hover:bg-pink-500 text-white'
                    }`}
                  >
                    {authProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Publication...</span>
                        <span className="sm:hidden">...</span>
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

          {/* Formulaire invité */}
          {!user?.data && formType === 'guest' && (
            <div className="mb-8 sm:mb-12">
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <input
                  type="text"
                  name="website"
                  value={guestData.website}
                  onChange={(e) => setGuestData('website', e.target.value)}
                  style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={guestData.guestName}
                      onChange={(e) => setGuestData('guestName', e.target.value)}
                      placeholder="Votre nom complet"
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 text-sm sm:text-base"
                    />
                    {guestErrors.guestName && (
                      <p className="text-red-400 text-xs sm:text-sm mt-1">
                        {guestErrors.guestName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                      Email (optionnel)
                    </label>
                    <input
                      type="email"
                      value={guestData.guestEmail}
                      onChange={(e) => setGuestData('guestEmail', e.target.value)}
                      placeholder="votre@email.com"
                      autoComplete="email"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 text-sm sm:text-base"
                    />
                    {guestErrors.guestEmail && (
                      <p className="text-red-400 text-xs sm:text-sm mt-1">
                        {guestErrors.guestEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                    Téléphone (optionnel)
                  </label>
                  <PhoneInput
                    value={guestData.guestPhone}
                    onChange={(value) => setGuestData('guestPhone', value || '')}
                    placeholder="Entrez votre numéro"
                    defaultCountry={defaultCountry}
                    international
                    className="w-full text-sm sm:text-base [&_input]:px-3 sm:[&_input]:px-4 [&_input]:py-2.5 sm:[&_input]:py-3 [&_input]:bg-gray-800 [&_input]:border-gray-700 [&_input]:text-white [&_input]:placeholder-gray-400 [&_input]:focus:ring-2 [&_input]:focus:ring-pink-500 [&_input]:focus:border-transparent [&_input]:rounded-lg [&_button]:bg-gray-800 [&_button]:border-gray-700 [&_button]:hover:bg-gray-700"
                  />
                  {guestErrors.guestPhone && (
                    <p className="text-red-400 text-xs sm:text-sm mt-1">{guestErrors.guestPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                    Votre message *
                  </label>
                  <textarea
                    value={guestData.message}
                    onChange={(e) => setGuestData('message', e.target.value)}
                    placeholder="Laissez-moi un message..."
                    rows={4}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-white placeholder-gray-400 text-sm sm:text-base"
                  />
                  {guestErrors.message && (
                    <p className="text-red-400 text-xs sm:text-sm mt-1">{guestErrors.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      guestProcessing || !guestData.message.trim() || !guestData.guestName.trim()
                    }
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                      guestProcessing || !guestData.message.trim() || !guestData.guestName.trim()
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-pink-600 hover:bg-pink-500 text-white'
                    }`}
                  >
                    {guestProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Envoi...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Envoyer le message</span>
                        <span className="sm:hidden">Envoyer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Commentaires */}
          <WhenVisible data="comments" fallback={<Fallback message="commentaires" />}>
            {() => {
              const comments = deferredComments as CommentsData
              return (
                <div className="space-y-6">
                  {comments?.data?.map((comment) => (
                    <div key={comment.id} className="flex gap-3 sm:gap-4 group">
                      <div className="flex-shrink-0">
                        {comment.user?.subInfo ? (
                          <img
                            src={comment.user.subInfo.photoPath}
                            alt={comment.displayName || comment.user.username}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs sm:text-sm">
                              {getInitials(comment.displayName || comment.guestName || 'V')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-white text-sm sm:text-base truncate">
                              {comment.displayName || comment.guestName}
                            </span>
                            {comment.commentType === 'guest' && (
                              <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300 flex-shrink-0">
                                Visiteur
                              </span>
                            )}
                            {comment.user?.provider && (
                              <span className="text-xs text-gray-500 hidden sm:inline">
                                (via {comment.user.provider})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {comment.reaction && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded border border-gray-700">
                                <span className="text-base sm:text-lg">{comment.reaction}</span>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleRemoveReaction(comment.id)}
                                    className="text-gray-400 hover:text-red-400 transition-colors"
                                    title="Supprimer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}

                            {isAdmin && (
                              <div className="relative">
                                <button
                                  onClick={() => {
                                    setShowReactionPicker(
                                      showReactionPicker === comment.id ? null : comment.id
                                    )
                                  }}
                                  className="emoji-button p-1 text-gray-400 hover:text-pink-400 transition-colors"
                                >
                                  <Smile className="w-4 h-4" />
                                </button>

                                {showReactionPicker === comment.id && (
                                  <>
                                    {/* Version mobile : plein écran en bas */}
                                    <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 emoji-picker">
                                      <div
                                        className="absolute inset-0 bg-black/50"
                                        onClick={() => setShowReactionPicker(null)}
                                      />
                                      <div className="relative bg-gray-800 border-t border-gray-700 rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto">
                                        <div className="flex justify-between items-center mb-4">
                                          <h3 className="text-white font-medium">
                                            Ajouter une réaction
                                          </h3>
                                          <button
                                            onClick={() => setShowReactionPicker(null)}
                                            className="text-gray-400 hover:text-white"
                                          >
                                            <X className="w-5 h-5" />
                                          </button>
                                        </div>
                                        <div className="space-y-4">
                                          {Object.entries({
                                            Positives: reactions.positive,
                                            Neutres: reactions.neutral,
                                            Négatives: reactions.negative,
                                          }).map(([label, emojis]) => (
                                            <div key={label}>
                                              <p className="text-xs font-medium text-gray-400 mb-2">
                                                {label}
                                              </p>
                                              <div className="flex flex-wrap gap-2">
                                                {emojis.map((emoji) => (
                                                  <button
                                                    key={emoji}
                                                    onClick={() =>
                                                      handleReactionClick(comment.id, emoji)
                                                    }
                                                    className="p-2 hover:bg-gray-700 rounded-lg text-2xl transition-colors"
                                                  >
                                                    {emoji}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Version desktop : dropdown */}
                                    <div className="hidden sm:block absolute right-0 top-full mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 w-64 emoji-picker max-h-[300px] overflow-y-auto">
                                      <div className="space-y-3">
                                        {Object.entries({
                                          Positives: reactions.positive,
                                          Neutres: reactions.neutral,
                                          Négatives: reactions.negative,
                                        }).map(([label, emojis]) => (
                                          <div key={label}>
                                            <p className="text-xs font-medium text-gray-400 mb-2">
                                              {label}
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                              {emojis.map((emoji) => (
                                                <button
                                                  key={emoji}
                                                  onClick={() =>
                                                    handleReactionClick(comment.id, emoji)
                                                  }
                                                  className="p-1 hover:bg-gray-700 rounded text-lg transition-colors"
                                                >
                                                  {emoji}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-300 mb-2 whitespace-pre-wrap text-sm sm:text-base break-words">
                          {comment.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <time className="flex items-center gap-1" dateTime={comment.createdAt}>
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{formatDate(comment.createdAt)}</span>
                          </time>
                          {comment.fullLocation && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{comment.fullLocation}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!comments?.data || comments.data.length === 0) && (
                    <div className="text-center py-12">
                      <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-sm sm:text-base">
                        Aucun message pour le moment.
                      </p>
                      <p className="text-gray-500 text-xs sm:text-sm">
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
