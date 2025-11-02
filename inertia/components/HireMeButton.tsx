import { useState } from 'react'
import { Mail, MessageCircle, FileText } from 'lucide-react'
import { Link, usePage } from '@inertiajs/react'
import type { InertiaProps } from '~/types/'
import Button from '@/components/Button'

interface HireMeButtonProps {
  className?: string
}

export default function HireMeButton({ className = '' }: HireMeButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { portfolioOwner } = usePage<InertiaProps>().props

  const email = portfolioOwner?.email
  const phone = portfolioOwner?.subInfo?.phone
  const cv = portfolioOwner?.subInfo?.cvPublicUrl

  // Formater le numéro de téléphone pour WhatsApp (enlever les espaces et caractères spéciaux)
  const whatsappNumber = phone?.replace(/\D/g, '')

  const handleWhatsAppClick = () => {
    if (whatsappNumber) {
      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Bonjour, je souhaite discuter d'un projet avec vous.")}`,
        '_blank'
      )
    }
  }

  const handleCVClick = () => {
    if (cv) {
      window.open(cv, '_blank')
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Bouton principal */}
      <Button
        as="button"
        variant="primary"
        onClick={() => setIsOpen(!isOpen)}
        className="mt-6 banner-button slide-up-and-fade hover:text-black hover:cursor-pointer"
      >
        {isOpen ? 'FERMER' : 'Me Contacter'}
      </Button>

      {/* Boutons de contact avec animation */}
      <div
        className={`
          absolute top-full left-1/2 -translate-x-1/2 mt-4
          flex justify-center gap-2 sm:gap-4
          transition-all duration-500 ease-out
          ${
            isOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }
        `}
      >
        {/* Bouton WhatsApp */}
        {whatsappNumber && (
          <button
            onClick={handleWhatsAppClick}
            className={`
              group relative flex items-center justify-center
              w-11 h-11 sm:w-14 sm:h-14 rounded-full flex-shrink-0
              bg-gradient-to-br from-[#25D366] to-[#128C7E]
              hover:shadow-2xl hover:shadow-[#25D366]/50
              transform hover:scale-110 hover:-rotate-6
              transition-all duration-300 ease-out
              ${isOpen ? 'animate-bounce-in-left' : ''}
            `}
            style={{
              animationDelay: '0.1s',
            }}
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white transform group-hover:scale-110 transition-transform" />

            {/* Tooltip */}
            <span
              className="
                absolute -top-10 left-1/2 -translate-x-1/2
                px-3 py-1.5 rounded-md
                bg-gray-900 text-white text-xs font-medium
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                whitespace-nowrap
                pointer-events-none
                z-10
              "
            >
              WhatsApp
              <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
            </span>

            {/* Effet de ripple */}
            <span className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
          </button>
        )}

        {/* Bouton Email */}
        {email && (
          <Link
            as="button"
            href={'/contact'}
            className={`
              group relative flex items-center justify-center
              w-11 h-11 sm:w-14 sm:h-14 rounded-full flex-shrink-0
              bg-gradient-to-br from-blue-500 to-blue-700
              hover:shadow-2xl hover:shadow-blue-500/50
              transform hover:scale-110 hover:rotate-6
              transition-all duration-300 ease-out
              ${isOpen ? 'animate-bounce-in-center' : ''}
            `}
            style={{
              animationDelay: '0.2s',
            }}
          >
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white transform group-hover:scale-110 transition-transform" />

            {/* Tooltip */}
            <span
              className="
                absolute -top-10 left-1/2 -translate-x-1/2
                px-3 py-1.5 rounded-md
                bg-gray-900 text-white text-xs font-medium
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                whitespace-nowrap
                pointer-events-none
                z-10
              "
            >
              Email
              <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
            </span>

            {/* Effet de ripple */}
            <span className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
          </Link>
        )}

        {/* Bouton CV */}
        {cv && (
          <button
            onClick={handleCVClick}
            className={`
              group relative flex items-center justify-center
              w-11 h-11 sm:w-14 sm:h-14 rounded-full flex-shrink-0
              bg-gradient-to-br from-purple-500 to-purple-700
              hover:shadow-2xl hover:shadow-purple-500/50
              transform hover:scale-110 hover:-rotate-6
              transition-all duration-300 ease-out
              ${isOpen ? 'animate-bounce-in-right' : ''}
            `}
            style={{
              animationDelay: '0.3s',
            }}
          >
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white transform group-hover:scale-110 transition-transform" />

            {/* Tooltip */}
            <span
              className="
                absolute -top-10 left-1/2 -translate-x-1/2
                px-3 py-1.5 rounded-md
                bg-gray-900 text-white text-xs font-medium
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                whitespace-nowrap
                pointer-events-none
                z-10
              "
            >
              Voir le CV
              <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
            </span>

            {/* Effet de ripple */}
            <span className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
          </button>
        )}
      </div>

      {/* Overlay invisible pour fermer au clic extérieur */}
      {isOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />}

      {/* Animations CSS personnalisées */}
      <style>{`
        @keyframes bounce-in-left {
          0% {
            opacity: 0;
            transform: translateX(-50px) scale(0.3);
          }
          50% {
            transform: translateX(10px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes bounce-in-center {
          0% {
            opacity: 0;
            transform: translateY(50px) scale(0.3);
          }
          50% {
            transform: translateY(-10px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounce-in-right {
          0% {
            opacity: 0;
            transform: translateX(50px) scale(0.3);
          }
          50% {
            transform: translateX(-10px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .animate-bounce-in-left {
          animation: bounce-in-left 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-bounce-in-center {
          animation: bounce-in-center 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-bounce-in-right {
          animation: bounce-in-right 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
      `}</style>
    </div>
  )
}
