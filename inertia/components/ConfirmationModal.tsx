import { X, Trash2, UserCheck, UserX } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  itemName?: string
  isLoading?: boolean
  actionType?: 'delete' | 'activate' | 'deactivate' | 'default'
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
  actionType = 'default',
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (actionType) {
      case 'delete':
        return <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
      case 'activate':
        return <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
      case 'deactivate':
        return <UserX className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
      default:
        return <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
    }
  }

  const getBackgroundColor = () => {
    switch (actionType) {
      case 'delete':
        return 'bg-red-100'
      case 'activate':
        return 'bg-green-100'
      case 'deactivate':
        return 'bg-orange-100'
      default:
        return 'bg-red-100'
    }
  }

  const getButtonClass = () => {
    switch (actionType) {
      case 'delete':
        return 'bg-red-600 hover:bg-red-700'
      case 'activate':
        return 'bg-green-600 hover:bg-green-700'
      case 'deactivate':
        return 'bg-orange-600 hover:bg-orange-700'
      default:
        return 'bg-red-600 hover:bg-red-700'
    }
  }

  const getButtonText = () => {
    switch (actionType) {
      case 'delete':
        return isLoading ? 'Suppression...' : 'Supprimer'
      case 'activate':
        return isLoading ? 'Activation...' : 'Activer'
      case 'deactivate':
        return isLoading ? 'Désactivation...' : 'Désactiver'
      default:
        return isLoading ? 'Suppression...' : 'Supprimer'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-[90%] sm:max-w-sm border border-gray-100"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="p-4 sm:p-6 text-center">
              {/* Icon */}
              <motion.div
                className={`w-12 h-12 sm:w-16 sm:h-16 ${getBackgroundColor()} rounded-full flex items-center justify-center mx-auto mb-4`}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.2, delay: 0.13 }}
              >
                {getIcon()}
              </motion.div>

              {/* Title */}
              <motion.h3
                className="text-lg sm:text-xl font-semibold text-gray-900 mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {title}
              </motion.h3>

              {/* Item name */}
              {itemName && (
                <motion.div
                  className="mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {itemName}
                  </span>
                </motion.div>
              )}

              {/* Message */}
              <motion.p
                className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {message}
              </motion.p>

              {/* Actions */}
              <motion.div
                className="flex flex-col sm:flex-row gap-2 sm:gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all duration-200 font-medium transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Annuler
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg ${getButtonClass()}`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {getButtonText()}
                    </>
                  ) : (
                    getButtonText()
                  )}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
