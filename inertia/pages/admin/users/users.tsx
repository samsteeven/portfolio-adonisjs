import React, { useState, useMemo, useEffect } from 'react'
import { Link, usePage } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Search,
  Filter,
  UserPlus,
  Shield,
  CheckCircle,
  XCircle,
  Calendar,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  X,
} from 'lucide-react'
import UserActions from '~/components/UserActions'
import { UserRole, USER_ROLE_LABELS, USER_ROLE_COLORS } from '~/enums/user_role'
import { AuthenticatedUser, InertiaProps } from '~/types'
import { formatMemberSince } from '~/utils/utils_string'

interface AdminUsersProps {
  users: Array<AuthenticatedUser>
}

export default function AdminUsers({ users }: AdminUsersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<'all' | UserRole>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [sortBy, setSortBy] = useState<'username' | 'email' | 'createdAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isClient, setIsClient] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { auth } = usePage<InertiaProps>().props
  const currentUser = auth!.user

  useEffect(() => {
    setIsClient(true)
  }, [])

  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return []

    let filtered = users.filter((user) => {
      const matchesSearch =
        !searchTerm ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = selectedRole === 'all' || user.role === selectedRole

      return matchesSearch && matchesRole
    })

    filtered.sort((a, b) => {
      let aValue: string | Date
      let bValue: string | Date

      switch (sortBy) {
        case 'username':
          aValue = a.username.toLowerCase()
          bValue = b.username.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        default:
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortOrder === 'asc'
        ? (aValue as Date).getTime() - (bValue as Date).getTime()
        : (bValue as Date).getTime() - (aValue as Date).getTime()
    })

    return filtered
  }, [users, searchTerm, selectedRole, sortBy, sortOrder])

  const handleReset = () => {
    setSearchTerm('')
    setSelectedRole('all')
    setSortBy('createdAt')
    setSortOrder('desc')
  }

  const activeFiltersCount = [searchTerm, selectedRole !== 'all' ? selectedRole : ''].filter(
    Boolean
  ).length

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {filteredAndSortedUsers.map((user) => (
        <Card
          key={user.id}
          className={`overflow-hidden hover:shadow-lg transition-all duration-300 border rounded-xl ${
            user.id === currentUser.id
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="p-4">
            {user.id === currentUser.id && (
              <div className="mb-3 flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
                  C'est vous
                </span>
              </div>
            )}

            <div className="flex flex-col items-center text-center">
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

              <h3 className="font-semibold text-gray-900 mb-1 truncate w-full">{user.username}</h3>
              <p className="text-sm text-gray-500 mb-3 truncate w-full">{user.email}</p>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3 ${USER_ROLE_COLORS[user.role as UserRole]}`}
              >
                <Shield className="w-3 h-3 mr-1" />
                {USER_ROLE_LABELS[user.role as UserRole]}
              </span>

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

              <div className="flex items-center justify-center text-xs text-gray-500 mb-4">
                <Calendar className="w-3 h-3 mr-1" />
                <span>
                  {isClient ? formatMemberSince(user.createdAt.toString()) : 'Chargement...'}
                </span>
              </div>

              <div className="mt-2">
                <UserActions user={user} />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  const ListView = () => (
    <Card className="overflow-hidden bg-white border border-gray-200 rounded-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Créé le
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedUsers.map((user, index) => (
              <tr
                key={user.id}
                className={`hover:bg-gray-50 transition-colors ${
                  user.id === currentUser.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : index % 2 === 0
                      ? 'bg-white'
                      : 'bg-gray-50/30'
                }`}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {user.subInfo?.photoPathPublicUrl ? (
                        <img
                          src={user.subInfo.photoPathPublicUrl}
                          alt={user?.username}
                          className="w-10 h-10 rounded-full object-cover ring-4 ring-gray-50"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{user.username}</span>
                        {user.id === currentUser.id && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                            Vous
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${USER_ROLE_COLORS[user.role as UserRole]}`}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {USER_ROLE_LABELS[user.role as UserRole]}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {user.isActive ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      {isClient ? formatMemberSince(user.createdAt.toString()) : 'Chargement...'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <UserActions user={user} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Utilisateurs</h1>
              <p className="mt-1 text-gray-600">
                Gérez les comptes utilisateurs et leurs permissions
              </p>
              <div className="mt-1 text-sm text-gray-500">
                {filteredAndSortedUsers.length} utilisateur
                {filteredAndSortedUsers.length > 1 ? 's' : ''} sur {users.length} au total
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtres{' '}
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              <Link href={'/admin/users/create'}>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4" />
                  Ajouter un utilisateur
                </Button>
              </Link>
            </div>
          </div>

          <Card
            className={`mb-6 p-4 sm:p-6 bg-white transition-all duration-300 ${showFilters ? 'block' : 'hidden md:block'}`}
          >
            <div className="space-y-4">
              <div className="flex md:hidden items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Filtres</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="p-1"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Nom d'utilisateur ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'all' | UserRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Tous</option>
                    {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tri</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="createdAt">Date création</option>
                      <option value="username">Nom d'utilisateur</option>
                      <option value="email">Email</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="w-full border border-gray-300 text-sm"
                    size="sm"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    Réinitialiser
                  </Button>
                </div>

                <div className="flex items-end">
                  <div className="flex w-full bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 py-2 rounded text-sm font-medium ${
                        viewMode === 'grid'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Vue grille"
                    >
                      <Grid3X3 className="h-4 w-4 mx-auto" />
                      <span className="sr-only">Grille</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 py-2 rounded text-sm font-medium ${
                        viewMode === 'list'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Vue liste"
                    >
                      <List className="h-4 w-4 mx-auto" />
                      <span className="sr-only">Liste</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {filteredAndSortedUsers.length > 0 ? (
            <>{viewMode === 'grid' ? <GridView /> : <ListView />}</>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchTerm || selectedRole !== 'all'
                  ? 'Aucun utilisateur trouvé'
                  : 'Aucun utilisateur'}
              </h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || selectedRole !== 'all'
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par créer votre premier utilisateur.'}
              </p>
              <div className="mt-6">
                {searchTerm || selectedRole !== 'all' ? (
                  <Button onClick={handleReset} variant="outline" className="border-gray-300">
                    Réinitialiser les filtres
                  </Button>
                ) : (
                  <Link href={'/admin/users/create'}>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 mx-auto">
                      <UserPlus className="h-4 w-4" />
                      Ajouter un utilisateur
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
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
