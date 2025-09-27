import React, { useState, useEffect } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import {
  Mail,
  Phone,
  User,
  MessageCircle,
  X,
  Send,
  CheckCircle,
  MapPin,
  Clock,
  Euro,
  Loader2,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
} from 'lucide-react'
import { ServiceType } from '~/types/services'
import { PhoneInput } from '@/components/ui/phone-input'
import type { CountryCode } from 'libphonenumber-js'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { toast } from 'sonner'

interface Props {
  selectedService?: ServiceType | null
  services?: ServiceType[]
  success?: boolean
  message?: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
  serviceId?: number
  website: string // Honeypot
}

export default function ContactIndex({ selectedService, services = [], success, message }: Props) {
  const [contextualService, setContextualService] = useState<ServiceType | null>(
    selectedService || null
  )
  const [defaultCountry, setDefaultCountry] = useState<CountryCode>('FR')

  useEffect(() => {
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

  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    serviceId: contextualService?.id,
    website: '', // Honeypot field
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate phone number if provided
    if (data.phone && !isValidPhoneNumber(data.phone, defaultCountry)) {
      toast.error('Numéro de téléphone invalide')
      return
    }

    post('/contact', {
      onSuccess: () => {
        reset()
        setContextualService(null)
      },
    })
  }

  const handleRemoveService = () => {
    setContextualService(null)
    setData('serviceId', undefined)
  }

  const getFieldError = (field: keyof FormData) => errors[field]

  return (
    <>
      <Head title={contextualService ? `Contact - ${contextualService.title}` : 'Contactez-moi'} />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm text-pink-300 rounded-full text-sm font-medium mb-8 border border-pink-500/20">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Commençons votre projet
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 tracking-tight">
              {contextualService ? (
                <>
                  <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    Parlons de{' '}
                  </span>
                  <br className="sm:hidden" />
                  <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                    {contextualService.title}
                  </span>
                </>
              ) : (
                <>
                  <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    Travaillons{' '}
                  </span>
                  <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                    ensemble
                  </span>
                </>
              )}
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {contextualService
                ? 'Décrivez-moi votre vision et transformons-la en réalité digitale exceptionnelle.'
                : 'Une idée, un projet, une question ? Je suis là pour vous accompagner dans votre transformation digitale.'}
            </p>
          </div>

          {/* Message de succès */}
          {success && (
            <div className="mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-4 text-green-300 backdrop-blur-sm">
              <div className="p-2 bg-green-500/20 rounded-full">
                <CheckCircle className="h-5 w-5" />
              </div>
              <p className="font-medium">
                {message || 'Votre message a été envoyé avec succès ! Je vous recontacte sous 24h.'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Formulaire principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Card du service contextuel */}
              {contextualService && (
                <div className="relative bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-sm border border-pink-500/30 rounded-3xl p-6 overflow-hidden">
                  <button
                    onClick={handleRemoveService}
                    className="absolute top-4 right-4 p-2 text-pink-300 hover:text-white hover:bg-pink-500/20 rounded-xl transition-all duration-200 z-10"
                    title="Supprimer le service sélectionné"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="pr-12">
                    <div className="flex items-start gap-4">
                      {contextualService.image && (
                        <img
                          src={contextualService.image}
                          alt={contextualService.title}
                          className="w-20 h-20 object-cover rounded-2xl flex-shrink-0 border border-pink-500/20"
                        />
                      )}

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-3">
                          {contextualService.title}
                        </h3>

                        {contextualService.price && (
                          <div className="flex items-center gap-2 text-green-300 mb-3">
                            <div className="p-1 bg-green-500/20 rounded-lg">
                              <Euro className="h-4 w-4" />
                            </div>
                            <span className="font-semibold">
                              {contextualService.formattedPrice}
                            </span>
                          </div>
                        )}

                        <p className="text-gray-300 leading-relaxed">
                          {contextualService.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Decorative glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>
                </div>
              )}

              {/* Formulaire */}
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 space-y-6 overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-transparent to-purple-500/5 rounded-3xl"></div>

                {/* Honeypot field - Hidden */}
                <input
                  type="text"
                  name="website"
                  value={data.website}
                  onChange={(e) => setData('website', e.target.value)}
                  style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Nom et Prénom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-200 mb-3">
                      Prénom *
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-pink-400 transition-colors" />
                      <input
                        type="text"
                        value={data.firstName}
                        onChange={(e) => setData('firstName', e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 ${
                          getFieldError('firstName')
                            ? 'border-red-400'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        placeholder="Votre prénom"
                        required
                      />
                    </div>
                    {getFieldError('firstName') && (
                      <p className="mt-2 text-sm text-red-400">{getFieldError('firstName')}</p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-200 mb-3">Nom *</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-pink-400 transition-colors" />
                      <input
                        type="text"
                        value={data.lastName}
                        onChange={(e) => setData('lastName', e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 ${
                          getFieldError('lastName')
                            ? 'border-red-400'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                    {getFieldError('lastName') && (
                      <p className="mt-2 text-sm text-red-400">{getFieldError('lastName')}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-200 mb-3">Email *</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-pink-400 transition-colors" />
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 ${
                        getFieldError('email')
                          ? 'border-red-400'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  {getFieldError('email') && (
                    <p className="mt-2 text-sm text-red-400">{getFieldError('email')}</p>
                  )}
                </div>

                {/* Téléphone */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-200 mb-3">
                    Téléphone <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <PhoneInput
                    value={data.phone}
                    onChange={(value) => setData('phone', value || '')}
                    placeholder="Entrez votre numéro de téléphone"
                    defaultCountry={defaultCountry}
                    international
                    className="w-full [&_input]:pl-12 [&_input]:pr-4 [&_input]:py-4 [&_input]:bg-gray-800/50 [&_input]:backdrop-blur-sm [&_input]:border [&_input]:rounded-2xl [&_input]:focus:ring-2 [&_input]:focus:ring-pink-500 [&_input]:focus:border-transparent [&_input]:transition-all [&_input]:duration-200 [&_input]:text-white [&_input]:placeholder-gray-400 [&_button]:hover:bg-gray-700"
                  />
                  {getFieldError('phone') && (
                    <p className="mt-2 text-sm text-red-400">{getFieldError('phone')}</p>
                  )}
                </div>

                {/* Message */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-200 mb-3">
                    Votre projet *
                  </label>
                  <div className="relative group">
                    <MessageCircle className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-pink-400 transition-colors" />
                    <textarea
                      value={data.message}
                      onChange={(e) => setData('message', e.target.value)}
                      rows={6}
                      className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 resize-none text-white placeholder-gray-400 ${
                        getFieldError('message')
                          ? 'border-red-400'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder={
                        contextualService
                          ? `Décrivez votre projet lié à ${contextualService.title}. Plus vous êtes précis, mieux je pourrai vous accompagner !`
                          : 'Parlez-moi de votre projet, vos objectifs, vos contraintes... Plus vous êtes détaillé, plus je pourrai vous proposer une solution adaptée !'
                      }
                      required
                    />
                  </div>
                  {getFieldError('message') && (
                    <p className="mt-2 text-sm text-red-400">{getFieldError('message')}</p>
                  )}
                </div>

                {/* Bouton d'envoi */}
                <button
                  onClick={handleSubmit}
                  disabled={processing}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25 border border-pink-500/20"
                >
                  <div className="relative flex items-center justify-center gap-2 px-6 py-3">
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Envoyer mon message</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                      </>
                    )}
                  </div>

                  {!processing && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:space-y-8">
              {/* Informations de contact */}
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-3xl"></div>

                <h3 className="relative text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  Me contacter directement
                </h3>

                <div className="relative space-y-5">
                  <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-2xl border border-gray-700/30">
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                      <p className="font-semibold text-white">hello@exemple.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-2xl border border-gray-700/30">
                    <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Téléphone</p>
                      <p className="font-semibold text-white">+33 6 12 34 56 78</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-2xl border border-gray-700/30">
                    <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Localisation</p>
                      <p className="font-semibold text-white">France</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Garanties */}
              <div className="relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/30 rounded-3xl p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-3xl"></div>

                <div className="relative">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <div className="p-2 bg-green-500/20 rounded-xl">
                      <Shield className="h-5 w-5 text-green-400" />
                    </div>
                    Mes engagements
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Clock className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-300">Réponse sous 24h</p>
                        <p className="text-sm text-gray-400">Même le weekend</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-300">Devis gratuit</p>
                        <p className="text-sm text-gray-400">Sans engagement</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Zap className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-purple-300">Accompagnement</p>
                        <p className="text-sm text-gray-400">Suivi personnalisé</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services disponibles */}
              {!contextualService && services.length > 0 && (
                <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-transparent to-purple-500/5 rounded-3xl"></div>

                  <h3 className="relative text-xl font-bold text-white mb-6">Mes services</h3>

                  <div className="relative space-y-3">
                    {services.slice(0, 4).map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setContextualService(service)
                          setData('serviceId', service.id)
                        }}
                        className="group w-full text-left p-4 hover:bg-gray-800/50 rounded-2xl transition-all duration-200 border border-gray-700/30 hover:border-pink-500/50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white group-hover:text-pink-300 transition-colors">
                            {service.title}
                          </span>
                          {service.price && (
                            <span className="text-sm text-green-400 font-medium px-2 py-1 bg-green-500/20 rounded-lg">
                              {service.formattedPrice}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}

                    {services.length > 4 && (
                      <button
                        onClick={() => router.visit('/services')}
                        className="w-full text-center p-4 text-pink-400 hover:text-pink-300 font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Voir tous les services</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
