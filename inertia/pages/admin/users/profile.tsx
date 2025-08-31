import React from 'react'
import AdminLayout from '~/layout/AdminLayout'
import { User, Mail, Calendar, Edit, Shield, Key, Settings } from 'lucide-react'
import { usePage, Link } from '@inertiajs/react'
import { getInitials, formatMemberSince } from '~/utils/utils_string'
import { InertiaProps } from '~/types'

export default function AdminProfile() {
  const { auth } = usePage<InertiaProps>().props

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600">Informations personnelles et sécurité</p>
        </div>
        <Link
          href={`/admin/users/${auth!.user.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Edit className="w-4 h-4" />
          Modifier le profil
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {getInitials(auth!.user!.username)}
                </span>
              </div>
              {/* Badge de statut en ligne (optionnel) */}
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{auth!.user!.username}</h3>
            <p className="text-gray-600 capitalize">{auth!.user!.role || 'Administrateur'}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Nom d'utilisateur</p>
                <p className="text-sm font-medium text-gray-900">{auth!.user!.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-sm font-medium text-gray-900">{auth!.user!.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Inscription</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatMemberSince(auth!.user!.createdAt.toString())}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
          <Link
            href="/admin/security"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Voir tout →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/profile/password"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Mot de passe</p>
              <p className="text-xs text-gray-600">Modifier votre mot de passe</p>
            </div>
          </Link>

          <Link
            href="/admin/profile/2fa"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Authentification 2FA</p>
              <p className="text-xs text-gray-600">Sécuriser votre compte</p>
            </div>
          </Link>

          <Link
            href="/admin/profile/sessions"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center transition-colors">
              <Settings className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Sessions</p>
              <p className="text-xs text-gray-600">Gérer les connexions</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Statistics Section (optionnel) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-600">Connexions ce mois</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">5</p>
            <p className="text-sm text-gray-600">Actions effectuées</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">2h</p>
            <p className="text-sm text-gray-600">Temps passé</p>
          </div>
        </div>
      </div>
    </div>
  )
}

AdminProfile.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Profil"
    description="Gérer mon profil administrateur"
    currentPath="/admin/profile"
  >
    {page}
  </AdminLayout>
)
