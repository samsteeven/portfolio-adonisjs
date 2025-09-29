import React, { useState, useMemo, useEffect } from 'react'
import { Link } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import { Search, Filter, UserPlus, Shield, CheckCircle, XCircle, Calendar } from 'lucide-react'
import UserActions from '~/components/UserActions'
import { UserRole, USER_ROLE_LABELS, USER_ROLE_COLORS } from '~/enums/user_role'
import { AuthenticatedUser } from '~/types'
import { formatMemberSince } from '~/utils/utils_string'

interface AdminUsersProps {
  users: Array<AuthenticatedUser>
}

export default function AdminUsers({ users }: AdminUsersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<'all' | UserRole>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Filtrage des utilisateurs
  const filteredUsers = useMemo(() => {
    if (!users) return []

    if (searchTerm.trim()) {
      return users.filter((user) => {
        const matchesSearch =
          user.username.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase().trim())

        const matchesRole = selectedRole === 'all' || user.role === selectedRole

        return matchesSearch && matchesRole
      })
    }
    return users
  }, [users, searchTerm, selectedRole])

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 p-6"
        >
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {user.subInfo?.photoPathPublicUrl ? (
                <img
                  src={user.subInfo.photoPathPublicUrl}
                  alt={user?.username}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-gray-50"
                />
              ) : (
                <span className="text-xl font-medium text-gray-900">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* User Info */}
            <h3 className="font-semibold text-gray-900 mb-1 truncate w-full">{user.username}</h3>
            <p className="text-sm text-gray-500 mb-3 truncate w-full">{user.email}</p>

            {/* Role Badge */}
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3 ${USER_ROLE_COLORS[user.role as UserRole]}`}
            >
              <Shield className="w-3 h-3 mr-1" />
              {USER_ROLE_LABELS[user.role as UserRole]}
            </span>

            {/* Status */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {user.isActive ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm ${user.isActive ? 'text-green-700' : 'text-red-700'}`}>
                {user.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-center text-xs text-gray-500 mb-4">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{isClient ? formatMemberSince(user.createdAt.toString()) : 'Chargement...'}</span>
            </div>

            {/* Actions */}
            <div className="mt-2">
              <UserActions user={user} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const TableView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider md:px-6 md:py-4">
                Utilisateur
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider md:px-6 md:py-4">
                Rôle
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider md:px-6 md:py-4">
                Statut
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider md:px-6 md:py-4">
                Créé le
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider md:px-6 md:py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user, index) => (
              <tr
                key={user.id}
                className={`hover:bg-gray-50 transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}
              >
                <td className="px-4 py-3 md:px-6 md:py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center md:w-11 md:h-11">
                      {user.subInfo?.photoPathPublicUrl ? (
                        <img
                          src={user.subInfo.photoPathPublicUrl}
                          alt={user?.username}
                          className="w-10 h-10 rounded-full object-cover ring-4 ring-gray-50 md:w-11 md:h-11"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ml-3 md:ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-xs text-gray-500 md:text-sm">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 md:px-6 md:py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium md:px-3 ${USER_ROLE_COLORS[user.role as UserRole]}`}
                  >
                    <Shield className="w-3 h-3 mr-1 hidden sm:block" />
                    {USER_ROLE_LABELS[user.role as UserRole]}
                  </span>
                </td>
                <td className="px-4 py-3 md:px-6 md:py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium md:px-3 ${
                      user.isActive
                        ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                        : 'bg-red-100 text-red-800 ring-1 ring-red-200'
                    }`}
                  >
                    {user.isActive ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    <span className="hidden sm:inline">{user.isActive ? 'Actif' : 'Inactif'}</span>
                    <span className="sm:hidden">{user.isActive ? 'A' : 'I'}</span>
                  </span>
                </td>
                <td className="px-4 py-3 md:px-6 md:py-4">
                  <div className="flex items-center text-xs text-gray-500 md:text-sm">
                    <Calendar className="w-4 h-4 mr-1 hidden sm:block" />
                    <span>{isClient ? formatMemberSince(user.createdAt.toString()) : 'Chargement...'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right md:px-6 md:py-4">
                  <UserActions user={user} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-5"></div>
          <div className="relative bg-white rounded-lg shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Gestion des utilisateurs
                </h1>
                <p className="text-gray-600 text-base sm:text-lg">
                  Gérez les comptes utilisateurs et leurs permissions
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Link
                  href={'/admin/users/create'}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-sm font-medium text-sm sm:text-base"
                >
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Ajouter</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-5">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom d'utilisateur ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Filter className="w-5 h-5 text-gray-400 hidden sm:block" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'all' | UserRole)}
                  className="px-3 py-2 sm:px-4 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors duration-200 text-sm sm:text-base min-w-[140px]"
                >
                  <option value="all">Tous les rôles</option>
                  {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tableau
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grille
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          {(searchTerm || selectedRole !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé
                {filteredUsers.length > 1 ? 's' : ''}
                {searchTerm && <span className="ml-1">pour "{searchTerm}"</span>}
                {selectedRole !== 'all' && (
                  <span className="ml-1">
                    avec le rôle "{USER_ROLE_LABELS[selectedRole as UserRole]}"
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Users Content */}
        <div className="space-y-6">
          {filteredUsers.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé
                  {filteredUsers.length > 1 ? 's' : ''}
                </h2>
                <div className="text-sm text-gray-500">Page 1 sur 1</div>
              </div>
              {viewMode === 'table' ? <TableView /> : <GridView />}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun utilisateur trouvé
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || selectedRole !== 'all'
                    ? 'Essayez de modifier vos critères de recherche ou de filtrage'
                    : "Aucun utilisateur n'est encore enregistré dans le système"}
                </p>
                {!searchTerm && selectedRole === 'all' && (
                  <Link
                    href={'/admin/users/create'}
                    className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                  >
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Créer le premier utilisateur
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

AdminUsers.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Utilisateurs"
    description="Gestion des comptes utilisateurs"
    currentPath="/admin/users"
  >
    {page}
  </AdminLayout>
)