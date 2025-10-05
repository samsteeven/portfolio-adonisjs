import { Head, router } from '@inertiajs/react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Zap,
  Users,
  Euro,
  Sparkles,
  MessageCircle,
  Clock,
  Shield,
  TrendingUp,
  Star,
} from 'lucide-react'
import SafeHTML from '~/components/safeHTML'
import { formatLocalDate } from '~/utils/utils_string'
import { useEffect, useState } from 'react'

interface ServiceType {
  id: number
  title: string
  slug: string
  description: string
  image: string | null
  price: number | null
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
  formattedPrice?: string | null
  publicUrl: string | null
  hasImage?: boolean
}

interface Props {
  service: ServiceType
}

export default function ServiceShow({ service }: Props) {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  const handleContactClick = () => {
    router.visit('/contact', {
      method: 'get',
      data: { selectedServiceId: service.slug },
    })
  }

  const handleBackClick = () => {
    router.visit('/services')
  }

  return (
    <>
      <Head title={`${service.title} - Mes Services`} />

      <div className="min-h-screen bg-gradient-to-br pt-4 from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto">
            <div className="my-3">
              <button
                onClick={handleBackClick}
                className="group flex items-center justify-center w-14 h-14 bg-gray-800/80 backdrop-blur-md hover:bg-gray-700/90 border border-gray-700/50  rounded-2xl transition-all duration-300 shadow-lg hover:cursor-pointer"
                title="Retour aux services"
              >
                <ArrowLeft className="h-6 w-6 text-gray-300 group-hover:text-pink-400 transition-colors" />
              </button>
            </div>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 backdrop-blur-sm text-pink-300 rounded-full text-sm font-medium border border-pink-500/20">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Service Premium
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    {service.title}
                  </span>
                </h1>

                {/* Price */}
                <div className="flex items-center gap-4">
                  {service.price ? (
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 backdrop-blur-sm text-green-100 rounded-2xl text-2xl font-bold border border-green-400/30">
                      <Euro className="h-6 w-6" />
                      {service.formattedPrice}
                    </div>
                  ) : (
                    <div className="inline-flex px-6 py-3 bg-gray-800/50 backdrop-blur-sm text-gray-200 rounded-2xl text-xl font-semibold border border-gray-600/50">
                      Sur devis personnalisé
                    </div>
                  )}
                </div>

                {/* Quick Features */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 backdrop-blur-sm text-green-300 rounded-full text-sm border border-green-500/20">
                    <CheckCircle className="h-4 w-4" />
                    Réponse sous 24h
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 backdrop-blur-sm text-blue-300 rounded-full text-sm border border-blue-500/20">
                    <Zap className="h-4 w-4" />
                    Qualité premium
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 backdrop-blur-sm text-purple-300 rounded-full text-sm border border-purple-500/20">
                    <Users className="h-4 w-4" />
                    Support continu
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4">
                  <button
                    onClick={handleContactClick}
                    type="button"
                    className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/25 border border-pink-500/20 overflow-hidden"
                  >
                    <div className="relative flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      <span>Démarrer mon projet</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                  </button>
                </div>
              </div>

              {/* Right: Image */}
              <div className="relative">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-gray-700/50 shadow-2xl">
                  {service.publicUrl ? (
                    <>
                      <img
                        src={service.publicUrl}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent pointer-events-none"></div>
                    </>
                  ) : (
                    <div className="relative w-full h-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 pointer-events-none"></div>

                      {/* Geometric patterns */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-8 left-8 w-20 h-20 bg-white/5 rounded-full"></div>
                        <div className="absolute top-20 right-16 w-12 h-12 bg-pink-500/20 rounded-full"></div>
                        <div className="absolute bottom-16 left-20 w-16 h-16 bg-purple-500/20 rounded-full"></div>
                        <div className="absolute bottom-8 right-8 w-8 h-8 bg-blue-500/20 rounded-full"></div>
                      </div>

                      <div className="relative text-9xl font-black text-white/30">
                        {service.title.charAt(0)}
                      </div>

                      {/* Tech icons */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-8 left-8 text-3xl opacity-20">💻</div>
                        <div className="absolute top-16 right-12 text-2xl opacity-20">⚡</div>
                        <div className="absolute bottom-12 left-16 text-2xl opacity-20">🚀</div>
                        <div className="absolute bottom-8 right-8 text-2xl opacity-20">✨</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating decorative elements */}
                <div className="absolute -inset-6 -z-10 pointer-events-none">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header avec date et titre */}
            <div className="mb-12">
              <p className="text-sm text-gray-400 mb-4">
                {isClient ? formatLocalDate(service.createdAt) : '...'}
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                {service.title}
              </h2>
            </div>

            {/* Contenu de la description */}
            <div className="relative">
              {/* Barre verticale décorative */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 via-purple-500 to-transparent rounded-full"></div>

              {/* Texte de description */}
              <div className="pl-8 sm:pl-12">
                <SafeHTML
                  html={service.description}
                  className="prose prose-lg text-lg prose-invert max-w-none text-gray-300 leading-relaxed prose-headings:text-white prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:mt-8 prose-h3:mb-4 prose-p:mb-6 prose-strong:text-white prose-strong:font-semibold prose-a:text-pink-400 prose-a:no-underline hover:prose-a:text-pink-300 prose-ul:my-6 prose-li:my-2"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Pourquoi choisir{' '}
                <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                  ce service
                </span>{' '}
                ?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Des avantages concrets pour votre projet
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Benefit 1 */}
              <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-pink-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="relative">
                  <div className="mb-4 p-3 bg-pink-500/10 rounded-xl border border-pink-500/20 inline-flex">
                    <Clock className="h-6 w-6 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Livraison rapide</h3>
                  <p className="text-gray-400">
                    Respect des délais et communication transparente tout au long du projet
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="relative">
                  <div className="mb-4 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 inline-flex">
                    <Star className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Qualité premium</h3>
                  <p className="text-gray-400">
                    Code propre, optimisé et respectant les meilleures pratiques du secteur
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="relative">
                  <div className="mb-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 inline-flex">
                    <Shield className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Support continu</h3>
                  <p className="text-gray-400">
                    Accompagnement et support technique même après la livraison du projet
                  </p>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="relative">
                  <div className="mb-4 p-3 bg-green-500/10 rounded-xl border border-green-500/20 inline-flex">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Évolutivité</h3>
                  <p className="text-gray-400">
                    Solutions conçues pour grandir avec votre entreprise et vos besoins
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)] pointer-events-none"></div>

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-gray-300 rounded-full text-sm font-medium mb-8 border border-gray-700/50">
              <Sparkles className="h-4 w-4 text-pink-400" />
              Commençons maintenant
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-white">Prêt à </span>
              <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                concrétiser
              </span>
              <span className="text-white"> votre projet ?</span>
            </h2>

            <p className="text-lg sm:text-xl text-gray-300 mb-12 leading-relaxed">
              Discutons de vos besoins et créons ensemble une solution sur mesure qui répond
              parfaitement à vos attentes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleContactClick}
                type="button"
                className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/25 border border-pink-500/20 overflow-hidden"
              >
                <div className="relative flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Contactez-moi maintenant</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Consultation gratuite • Réponse sous 24h
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
