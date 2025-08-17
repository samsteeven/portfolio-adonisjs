import React from 'react'
import AdminLayout from '~/layout/AdminLayout'
import { User, Mail, Calendar, Edit } from 'lucide-react'

export default function AdminProfile() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600">Informations personnelles et sécurité</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Edit className="w-4 h-4" />
          Modifier le profil
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Sam Portfolio</h3>
            <p className="text-gray-600">Administrateur</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">sam_portfolio</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">sam@portfolio.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Membre depuis Janvier 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité</h3>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-sm">🔒</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Changer mot de passe</span>
          </button>
          
          <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-sm">🔐</span>
            </div>
            <span className="text-sm font-medium text-gray-700">2FA</span>
          </button>
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
