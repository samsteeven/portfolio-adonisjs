import { CheckCircle, XCircle, Mail } from 'lucide-react'
import { Head, Link } from '@inertiajs/react'

type UnsubscribeStatusProps = {
  success: boolean
  message: string
}

export default function UnsubscribeStatus({ success, message }: UnsubscribeStatusProps) {
  return (
    <>
      <Head title={success ? 'Désabonnement réussi' : 'Désabonnement invalide'} />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {!success ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/30 blur-xl rounded-full"></div>
                  <div className="relative bg-red-500/20 p-4 rounded-full">
                    <XCircle className="w-16 h-16 text-red-400" strokeWidth={2} />
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-3 text-center">Oups !</h2>
              <p className="text-lg font-semibold text-red-400 mb-4 text-center">
                Désabonnement invalide
              </p>
              <p className="text-gray-300 text-center mb-8 leading-relaxed">{message}</p>

              <Link
                href="/#newsletter"
                className="group relative w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <Mail className="w-5 h-5" />
                <span>S'abonner à nouveau</span>
              </Link>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full animate-pulse"></div>
                  <div className="relative bg-green-500/20 p-4 rounded-full">
                    <CheckCircle className="w-16 h-16 text-green-400" strokeWidth={2} />
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-3 text-center">C'est fait !</h2>
              <p className="text-lg font-semibold text-green-400 mb-4 text-center">
                Désabonnement réussi
              </p>
              <p className="text-gray-300 text-center mb-3 leading-relaxed">{message}</p>
              <p className="text-gray-400 text-sm text-center">
                Vous pouvez fermer cette page en toute sécurité.
              </p>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-gray-400 text-sm mb-4">Vous avez changé d'avis ?</p>
                <Link
                  href="/#newsletter"
                  className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-medium transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  <span>Se réabonner</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
