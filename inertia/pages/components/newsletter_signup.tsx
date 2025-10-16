import { useState } from 'react'
import { Mail, Send, Check, Sparkles, Shield, Zap, X } from 'lucide-react'
import { RoughAnnotate } from '@/components/RoughAnnotate'
import { Form } from '@inertiajs/react'

interface NewsletterSignupProps {
  errors?: {
    email?: string
  }
  success?: boolean
  className?: string
}

export default function Newsletter_signup({ success, className = '' }: NewsletterSignupProps) {
  const [isSubmitted, setIsSubmitted] = useState(success || false)

  return (
    <div className={`relative  ${className}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
      </div>

      <div
        id="newsletter"
        className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 lg:p-12 overflow-hidden"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-transparent to-purple-500/5 rounded-3xl"></div>

        <div className="relative text-center">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm text-pink-300 rounded-full text-sm font-medium mb-6 border border-pink-500/20">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Newsletter exclusive
                </div>

                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    Restez dans la{' '}
                  </span>
                  <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                    boucle
                  </span>
                </h3>

                <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Recevez en avant-première mes derniers projets, articles techniques et conseils
                  exclusifs directement dans votre boîte mail.
                </p>

                <div className="inline-block mb-8">
                  <RoughAnnotate strokeWidth={4} color="#ec4899" type={'box'} padding={8}>
                    <p className="text-xl font-bold text-pink-400 px-2 py-1">
                      Rejoignez la communauté !
                    </p>
                  </RoughAnnotate>
                </div>

                {/* Features */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-green-300 text-sm">Pas de spam</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20">
                    <Zap className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-300 text-sm">Contenu premium</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">1x par semaine max</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <Form
                method="post"
                action={'/newsletter/subscribe'}
                className="space-y-6 inert:opacity-50 inert:pointer-events-none max-w-md mx-auto"
                disableWhileProcessing
                options={{
                  preserveScroll: true,
                  preserveState: true,
                }}
                onSuccess={() => setIsSubmitted(true)}
              >
                {({ errors, processing, isDirty }) => (
                  <>
                    <div className="relative group">
                      <input
                        type="text"
                        name="website"
                        style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-pink-400 transition-colors" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="votre@email.com"
                        autoComplete="email"
                        className={`w-full pl-12 pr-20 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-none transition-all duration-200 text-white placeholder-gray-400 ${
                          errors?.email
                            ? 'border-red-400 focus:ring-red-500'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        required
                      />
                      <button
                        type="submit"
                        disabled={processing || !isDirty}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/25 group/btn"
                      >
                        {processing ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Send className="w-5 h-5 text-white group-hover/btn:translate-x-0.5 transition-transform" />
                        )}
                      </button>
                    </div>

                    {errors?.email && (
                      <div className="flex items-center justify-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                        <X className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{errors.email}</span>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 leading-relaxed">
                      <p className="flex items-center justify-center gap-2">
                        <Shield className="w-3 h-3 text-green-400" />
                        Vos données sont protégées et ne seront jamais partagées.
                      </p>
                      <p className="mt-1">Désabonnement en un clic à tout moment.</p>
                    </div>
                  </>
                )}
              </Form>
            </>
          ) : (
            /* Success State */
            <div className="py-4">
              <div className="inline-flex items-center justify-center w-17 h-17 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl mb-6 border border-green-500/20">
                <Check className="w-10 h-10 text-green-400" />
              </div>

              <h4 className="text-2xl sm:text-3xl font-bold text-green-400 mb-4">
                Bienvenue à bord ! 🎉
              </h4>

              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Merci de vous être abonné ! Vous recevrez bientôt du contenu exclusif directement
                dans votre boîte mail.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-green-300 text-sm">Email confirmé</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300 text-sm">Newsletter activée</span>
                </div>
              </div>

              <p className="text-sm text-gray-400 mt-6">
                Pensez à vérifier vos spams si vous ne recevez rien dans les prochains jours.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
