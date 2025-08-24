import {
  X,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Phone,
  Calendar,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthenticatedUser } from '~/types'
import { formatMemberSince, getInitials } from '~/utils/utils_string'

interface UserInfoModalProps {
  isOpen: boolean
  onClose: () => void
  user: AuthenticatedUser
}

export default function UserInfoModal({ isOpen, onClose, user }: UserInfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-100"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="flex flex-col items-center mb-6">
                {user.subInfo?.photoPathPublicUrl ? (
                  <img
                    src={user.subInfo.photoPathPublicUrl}
                    alt={user.username}
                    className="w-20 h-20 rounded-full object-cover border shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center shadow-md">
                    <p className="text-4xl font-semibold text-gray-900">
                      {getInitials(user.username)}
                    </p>
                  </div>
                )}

                <h2 className="mt-3 text-xl font-semibold text-gray-900">{user.username}</h2>
                <p className="text-gray-500 flex items-center gap-1 text-sm">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>

              {/* Infos */}
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Rôle : </span>
                  <span className="font-medium capitalize">{user.role}</span>
                </div>

                <div className="flex items-center gap-2">
                  {user.isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>
                    Statut :{' '}
                    <span
                      className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </span>
                </div>

                {user.subInfo?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <a href={`tel:${user.subInfo.phone}`} className="font-medium hover:underline">
                      {user.subInfo.phone}
                    </a>
                  </div>
                )}

                {user.subInfo?.bio && (
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-600 text-sm italic">
                    {user.subInfo.bio}
                  </div>
                )}

                {/* Profils sociaux */}
                <div className="space-y-2 mt-2">
                  {user.subInfo?.profilGithub && (
                    <a
                      href={user.subInfo.profilGithub}
                      target="_blank"
                      className="flex items-center gap-2 hover:underline text-gray-700 hover:text-gray-900"
                    >
                      <LinkIcon className="w-4 h-4" /> Github
                    </a>
                  )}
                  {user.subInfo?.profilLinkedin && (
                    <a
                      href={user.subInfo.profilLinkedin}
                      target="_blank"
                      className="flex items-center gap-2 hover:underline text-gray-700 hover:text-gray-900"
                    >
                      <LinkIcon className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                  {user.subInfo?.profilTwitter && (
                    <a
                      href={user.subInfo.profilTwitter}
                      target="_blank"
                      className="flex items-center gap-2 hover:underline text-gray-700 hover:text-gray-900"
                    >
                      <LinkIcon className="w-4 h-4" /> Twitter
                    </a>
                  )}
                </div>

                {/* Dates */}
                <div className="sm:flex mt-4 sm:items-center sm:justify-around">
                  <div className="flex items-center gap-2 text-gray-500 mt-4 sm:mt-0 text-xs">
                    <Calendar className="w-4 h-4" />
                    <span>{formatMemberSince(user.createdAt.toString())}</span>
                  </div>
                  {user.updatedAt && (
                    <div className="flex items-center gap-2 mt-2 sm:mt-0  text-gray-400 text-xs">
                      <Calendar className="w-4 h-4" />
                      <span>Mis à jour le {new Date(user.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
