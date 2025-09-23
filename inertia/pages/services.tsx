import { Head, router } from '@inertiajs/react'
import {
  ArrowRight,
  Star,
  CheckCircle,
  Zap,
  Users,
  Euro,
  Sparkles,
  MessageCircle,
} from 'lucide-react'
import { ServiceType } from '~/types/services'

interface Props {
  services: ServiceType[]
  stats: {
    total: number
    withPrice: number
    withoutPrice: number
  }
}

export default function ServicesIndex({ services, stats }: Props) {
  const handleContactClick = (service: ServiceType) => {
    router.visit('/contact', {
      method: 'get',
      data: { selectedServiceId: service.slug },
    })
  }

  return (
    <>
      <Head title="Mes Services - Portfolio" />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm text-pink-300 rounded-full text-sm font-medium mb-8 border border-pink-500/20">
              <Sparkles className="h-4 w-4 animate-pulse" />
              {stats.total} services d'excellence disponibles
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Transformons vos{' '}
              </span>
              <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                idées
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                en réalité
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Expert en développement digital, je vous accompagne de la conception à la mise en
              ligne. Chaque projet est unique, chaque solution est sur mesure.
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-300">Réponse sous 24h</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-blue-300">Solutions sur mesure</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-300">Expertise confirmée</span>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Mes{' '}
                <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                  Services
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Des solutions complètes pour tous vos besoins digitaux
              </p>
            </div>

            {/* Services List - Alternating Layout */}
            <div className="space-y-16 lg:space-y-24">
              {services.map((service, index) => {
                const isEven = index % 2 === 0
                return (
                  <div
                    key={service.id}
                    className="group relative"
                    style={{
                      animationDelay: `${index * 200}ms`,
                      animation: 'fadeInUp 0.8s ease-out forwards',
                    }}
                  >
                    <div
                      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center`}
                    >
                      {/* Service Image */}
                      <div className="relative flex-1 max-w-lg mx-auto lg:mx-0">
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-gray-700/50 group-hover:border-pink-500/50 transition-all duration-500">
                          {service.image ? (
                            <>
                              <img
                                src={service.image}
                                alt={service.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent"></div>
                            </>
                          ) : (
                            <div className="relative w-full h-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10"></div>

                              {/* Geometric patterns */}
                              <div className="absolute inset-0">
                                <div className="absolute top-8 left-8 w-16 h-16 bg-white/5 rounded-full"></div>
                                <div className="absolute top-16 right-12 w-8 h-8 bg-pink-500/20 rounded-full"></div>
                                <div className="absolute bottom-12 left-16 w-12 h-12 bg-purple-500/20 rounded-full"></div>
                                <div className="absolute bottom-8 right-8 w-6 h-6 bg-blue-500/20 rounded-full"></div>
                              </div>

                              <div className="relative text-8xl font-black text-white/30 group-hover:text-white/40 transition-colors duration-500">
                                {service.title.charAt(0)}
                              </div>

                              {/* Tech icons floating around */}
                              <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-6 left-6 text-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                                  💻
                                </div>
                                <div className="absolute top-12 right-8 text-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                                  ⚡
                                </div>
                                <div className="absolute bottom-8 left-12 text-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                                  🚀
                                </div>
                                <div className="absolute bottom-6 right-6 text-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                                  ✨
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Price Badge */}
                          <div className="absolute top-6 right-6 z-10">
                            {service.price ? (
                              <div className="flex items-center gap-1 px-4 py-2 bg-green-500/90 backdrop-blur-sm text-green-100 rounded-full text-sm font-semibold shadow-lg border border-green-400/30">
                                <Euro className="h-4 w-4" />
                                {service.formattedPrice}
                              </div>
                            ) : (
                              <div className="px-4 py-2 bg-gray-800/90 backdrop-blur-sm text-gray-200 rounded-full text-sm font-medium shadow-lg border border-gray-600/50">
                                Sur devis
                              </div>
                            )}
                          </div>

                          {/* Hover glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                        </div>

                        {/* Floating decorative elements */}
                        <div className="absolute -inset-4 -z-10">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-150"></div>
                        </div>
                      </div>

                      {/* Service Content */}
                      <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
                        <div className="space-y-6">
                          {/* Service Category */}
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 backdrop-blur-sm text-pink-300 rounded-full text-sm font-medium border border-pink-500/20">
                            <Sparkles className="h-4 w-4" />
                            Service Premium
                          </div>

                          {/* Title */}
                          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white group-hover:text-pink-300 transition-colors duration-300">
                            {service.title}
                          </h3>

                          {/* Description */}
                          <p className="text-lg text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                            {service.description}
                          </p>

                          {/* Features */}
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 backdrop-blur-sm text-green-300 rounded-full text-sm border border-green-500/20">
                              <CheckCircle className="h-4 w-4" />
                              Réponse sous 24h
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 backdrop-blur-sm text-blue-300 rounded-full text-sm border border-blue-500/20">
                              <Zap className="h-4 w-4" />
                              Qualité premium
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 backdrop-blur-sm text-purple-300 rounded-full text-sm border border-purple-500/20">
                              <Users className="h-4 w-4" />
                              Support continu
                            </div>
                          </div>

                          {/* CTA Button */}
                          <div className="pt-4">
                            <button
                              onClick={() => handleContactClick(service)}
                              className="group/btn inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/25"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span>Discuter du projet</span>
                              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                      <div
                        className={`absolute ${isEven ? 'top-1/2 left-0' : 'top-1/2 right-0'} w-96 h-96 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-full blur-3xl transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000`}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="relative py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]"></div>

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-gray-300 rounded-full text-sm font-medium mb-8 border border-gray-700/50">
              <Sparkles className="h-4 w-4 text-pink-400" />
              Projet personnalisé
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-white">Une idée </span>
              <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                unique
              </span>
              <span className="text-white"> en tête ?</span>
            </h2>

            <p className="text-lg sm:text-xl text-gray-300 mb-12 leading-relaxed">
              Chaque projet est différent. Parlons de vos besoins spécifiques et créons ensemble la
              solution parfaite.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.visit('/contact')}
                className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/25 border border-pink-500/20 overflow-hidden"
              >
                <div className="relative flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Démarrons votre projet</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Consultation gratuite
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
