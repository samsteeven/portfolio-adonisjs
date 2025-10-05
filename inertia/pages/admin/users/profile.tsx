import React, { useState, useEffect } from 'react'
import AdminLayout from '~/layout/AdminLayout'
import {
  Mail,
  Phone,
  Calendar,
  Edit,
  Github,
  Linkedin,
  Twitter,
  User as UserIcon,
  Shield,
  Clock,
} from 'lucide-react'
import { usePage, Link } from '@inertiajs/react'
import { getInitials, formatMemberSince } from '~/utils/utils_string'
import { InertiaProps } from '~/types'

export default function AdminProfile() {
  const { auth } = usePage<InertiaProps>().props
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDate = (dateString: string) => {
    if (!isClient) return '...'
    return formatMemberSince(dateString)
  }

  const user = auth?.user
  const subInfo = user?.subInfo

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Gérez vos informations personnelles
            </p>
          </div>
          <Link
            href={`/admin/users/${user?.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Edit className="w-4 h-4" />
            Modifier le profil
          </Link>
        </div>

        {/* Carte principale du profil */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête avec avatar et infos principales */}
          <div className="relative">
            {/* Bannière décorative */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>

            {/* Contenu de l'en-tête */}
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-12">
                {/* Avatar */}
                <div className="relative">
                  {subInfo?.photoPathPublicUrl ? (
                    <img
                      src={subInfo.photoPathPublicUrl}
                      alt={user?.username}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-blue-600 rounded-xl flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-2xl sm:text-3xl font-bold text-white">
                        {getInitials(user?.username || '')}
                      </span>
                    </div>
                  )}
                  {/* Indicateur de statut */}
                  <div
                    className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white ${user?.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                  ></div>
                </div>

                {/* Informations principales */}
                <div className="flex-1 sm:mb-2">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {user?.username}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        user?.isActive
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {user?.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="font-medium capitalize text-blue-600">{user?.role}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>Membre depuis {formatDate(user?.createdAt?.toString() || '')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {subInfo?.bio && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 text-sm leading-relaxed">{subInfo.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Informations de contact et réseaux sociaux */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Téléphone */}
              {subInfo?.phone && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Téléphone
                    </p>
                    <p className="text-sm font-medium text-gray-900">{subInfo.phone}</p>
                  </div>
                </div>
              )}

              {/* Date d'inscription */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Membre depuis
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(user?.createdAt?.toString() || '')}
                  </p>
                </div>
              </div>

              {/* Réseaux sociaux */}
              {(subInfo?.profilGithub ||
                subInfo?.profilLinkedin ||
                subInfo?.profilTwitter ||
                subInfo?.profilDiscord) && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Réseaux sociaux
                    </p>
                    <div className="flex gap-2">
                      {subInfo?.profilGithub && (
                        <a
                          href={subInfo.profilGithub}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-white hover:bg-gray-900 border border-gray-300 rounded-lg flex items-center justify-center transition-colors group"
                          title="GitHub"
                        >
                          <Github className="w-4 h-4 text-gray-700 group-hover:text-white" />
                        </a>
                      )}
                      {subInfo?.profilLinkedin && (
                        <a
                          href={subInfo.profilLinkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-white hover:bg-blue-600 border border-gray-300 rounded-lg flex items-center justify-center transition-colors group"
                          title="LinkedIn"
                        >
                          <Linkedin className="w-4 h-4 text-blue-600 group-hover:text-white" />
                        </a>
                      )}
                      {subInfo?.profilTwitter && (
                        <a
                          href={subInfo.profilTwitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-white hover:bg-sky-500 border border-gray-300 rounded-lg flex items-center justify-center transition-colors group"
                          title="Twitter"
                        >
                          <Twitter className="w-4 h-4 text-sky-500 group-hover:text-white" />
                        </a>
                      )}
                      {subInfo?.profilDiscord && (
                        <a
                          href={subInfo.profilDiscord}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-white hover:bg-indigo-600 border border-gray-300 rounded-lg flex items-center justify-center transition-colors group"
                          title="Discord"
                        >
                          <svg
                            viewBox="0 0 256 199"
                            className="w-4 h-4 group-hover:fill-white fill-[#5865F2]"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="xMidYMid"
                          >
                            <path d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section détails du compte */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Détails du compte</h3>
            <Link
              href={`/admin/users/${user?.id}/edit`}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1"
            >
              Modifier
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Nom d'utilisateur
              </p>
              <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Adresse email
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Rôle</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">{user?.role}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Statut du compte
              </p>
              <p
                className={`text-sm font-semibold inline-flex items-center gap-1.5 ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${user?.isActive ? 'bg-green-600' : 'bg-red-600'}`}
                ></span>
                {user?.isActive ? 'Actif' : 'Inactif'}
              </p>
            </div>
          </div>
        </div>

        {/* Section actions rapides (optionnelle) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link
              href={`/admin/users/${user?.id}/edit`}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <Edit className="w-5 h-5 text-blue-600 group-hover:text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Modifier le profil</p>
                <p className="text-xs text-gray-500">Mettre à jour vos infos</p>
              </div>
            </Link>

            <Link
              href={'/admin/users'}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                <UserIcon className="w-5 h-5 text-gray-600 group-hover:text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Gérer les utilisateurs</p>
                <p className="text-xs text-gray-500">Voir tous les comptes</p>
              </div>
            </Link>

            <Link
              href={'/admin/dashboard'}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                <Shield className="w-5 h-5 text-gray-600 group-hover:text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Tableau de bord</p>
                <p className="text-xs text-gray-500">Retour à l'accueil</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

AdminProfile.layout = (page: React.ReactNode) => (
  <AdminLayout title="Profil" description="Gérer le profil" currentPath="/admin/profile">
    {page}
  </AdminLayout>
)
