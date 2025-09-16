import { useState } from 'react'
import { Form } from '@inertiajs/react'
import { Mail, Send, Check, X } from 'lucide-react'
import { RoughAnnotate } from '@/components/RoughAnnotate'

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
    <div className={`p-8 ${className}`} id="newsletter">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500/20 rounded-full mb-4">
          <Mail className="w-8 h-8 text-pink-400" />
        </div>
        <h3 className="sm:text-2xl md:text-3xl font-bold text-white mb-2">Newsletter</h3>
        <p className="text-gray-400 md:text-xl">
          Restez au courant de mes derniers articles et projets
        </p>
        <div className="inline-block mt-2">
          <RoughAnnotate strokeWidth={4} color="#3A132B" type={'box'} padding={4}>
            <p className="md:text-lg font-anton">Abonnez - vous !</p>
          </RoughAnnotate>
        </div>
      </div>

      {!isSubmitted ? (
        <Form
          method="post"
          action={'/newsletter/subscribe'}
          className="space-y-4 inert:opacity-50 inert:pointer-events-none"
          disableWhileProcessing
          options={{
            preserveScroll: true,
            preserveState: true,
          }}
          onSuccess={() => setIsSubmitted(true)}
        >
          {({ errors }) => (
            <>
              <div className="relative w-full max-w-lg mx-auto">
                <input
                  type="email"
                  name="email"
                  placeholder="votre@email.com"
                  autoComplete={'email'}
                  className={`w-full px-4 py-3 bg-gray-800/50 border ${
                    errors?.email ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                  required
                />
                <button
                  type="submit"
                  className="absolute hover:cursor-pointer right-2 top-1/2 transform -translate-y-1/2 p-2 bg-pink-500 hover:bg-pink-600 rounded-md transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>

              {errors?.email && (
                <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
                  <X className="w-4 h-4" />
                  {errors.email}
                </div>
              )}
              <p className="text-xs text-center text-gray-500">
                Pas de spam, uniquement du contenu de qualité. Désabonnement facile à tout moment.
              </p>
            </>
          )}
        </Form>
      ) : (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h4 className="text-lg font-semibold text-green-400 mb-2">Inscription réussie !</h4>
          <p className="text-gray-400">
            Merci de vous être abonné à ma newsletter. Vous recevrez bientôt mes dernières
            actualités.
          </p>
        </div>
      )}
    </div>
  )
}
