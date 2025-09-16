import React from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

type UnsubscribeStatusProps = {
  isSubscribed: boolean
}

const UnsubscribeStatus: React.FC<UnsubscribeStatusProps> = ({ isSubscribed }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      {!isSubscribed ? (
        <div className="flex flex-col items-center justify-center">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-2">Désabonnement invalide</h2>
          <p className="text-gray-400 max-w-md">
            Vous n'êtes plus abonné ou le lien de désabonnement est invalide.
          </p>
          <a
            href="/#newsletter"
            className=" px-4 py-2 sm:px-6 sm:py-3 mt-10 border-2 border-pink-500 text-pink-500 font-semibold rounded-lg transition-all duration-200 hover:bg-pink-500 hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            S’abonner à nouveau
          </a>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-green-500 mb-2">Désabonnement réussi</h2>
          <p className="text-gray-400 max-w-md">
            Vous avez été retiré de notre newsletter et ne recevrez plus nos emails.
          </p>
          <p>Vous pouvez fermer cette page.</p>
        </div>
      )}
    </div>
  )
}

export default UnsubscribeStatus
