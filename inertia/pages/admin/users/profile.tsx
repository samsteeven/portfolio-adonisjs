import React, { useState, useEffect } from 'react'
import AdminLayout from '~/layout/AdminLayout'
import { Mail, Phone, Calendar, Edit, Github, Linkedin, Twitter } from 'lucide-react'
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header simple */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Mon Profil</h1>
            <p className="text-gray-600 text-sm mt-1">Gérez vos informations personnelles</p>
          </div>
          <Link
            href={`/admin/users/${user?.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-sm hover:bg-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
        </div>

        {/* Carte de profil principale */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Section avatar et infos principales */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {subInfo?.photoPathPublicUrl ? (
                  <img
                    src={subInfo.photoPathPublicUrl}
                    alt={user?.username}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-50"
                  />
                ) : (
                  <div className="w-18 h-18 bg-blue-500 rounded-full flex items-center justify-center ring-4 ring-gray-50">
                    <span className="text-xl font-semibold text-white">
                      {getInitials(user?.username || '')}
                    </span>
                  </div>
                )}
              </div>

              {/* Informations principales */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{user?.username}</h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user?.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <p className="text-blue-600 font-medium text-sm capitalize mb-3">{user?.role}</p>

                {subInfo?.bio && (
                  <p className="text-gray-600 text-sm leading-relaxed max-w-md">{subInfo.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{user?.email}</span>
              </div>

              {/* Téléphone */}
              {subInfo?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{subInfo.phone}</span>
                </div>
              )}

              {/* Date d'inscription */}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  Membre depuis {formatDate(user?.createdAt?.toString() || '')}
                </span>
              </div>

              {/* Réseaux sociaux */}
              {(subInfo?.profilGithub || subInfo?.profilLinkedin || subInfo?.profilTwitter) && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 text-gray-400 text-xs font-medium">Social</span>
                  <div className="flex gap-2">
                    {subInfo?.profilGithub && (
                      <a
                        href={subInfo.profilGithub}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 bg-gray-100 hover:bg-gray-900 rounded-md flex items-center justify-center transition-colors group"
                      >
                        <Github className="w-4 h-4 text-gray-600 group-hover:text-white" />
                      </a>
                    )}
                    {subInfo?.profilLinkedin && (
                      <a
                        href={subInfo.profilLinkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 bg-blue-100 hover:bg-blue-600 rounded-md flex items-center justify-center transition-colors group"
                      >
                        <Linkedin className="w-4 h-4 text-blue-600 group-hover:text-white" />
                      </a>
                    )}
                    {subInfo?.profilTwitter && (
                      <a
                        href={subInfo.profilTwitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 bg-sky-100 hover:bg-sky-500 rounded-md flex items-center justify-center transition-colors group"
                      >
                        <Twitter className="w-4 h-4 text-sky-600 group-hover:text-white" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section paramètres du compte (optionnel, plus compact) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Paramètres du compte</h3>
            <Link
              href={`/admin/users/${user?.id}/edit`}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Modifier →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Nom d'utilisateur</p>
              <p className="font-medium text-gray-900">{user?.username}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Rôle</p>
              <p className="font-medium text-gray-900 capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Statut</p>
              <p className={`font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {user?.isActive ? 'Actif' : 'Inactif'}
              </p>
            </div>
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
