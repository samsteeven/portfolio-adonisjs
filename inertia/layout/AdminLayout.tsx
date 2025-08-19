import React, { useState } from 'react'
import { HeadLayout } from './HeadLayout'
import { usePage, Link, router } from '@inertiajs/react'
import { InertiaProps } from '~/types'
import { cn } from '@/utils'
import {
  LayoutDashboard,
  User as UserIcon, // Renommage de l'icône pour éviter le conflit
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Mail,
  Briefcase,
  Award,
} from 'lucide-react'
import { getInitials } from '~/utils/utils_string'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  currentPath?: string
}

const adminMenuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { name: 'Profil', icon: UserIcon, href: '/admin/profile' }, // Utilisation de l'icône renommée
  { name: 'Utilisateurs', icon: Users, href: '/admin/users' },
  { name: 'Projets', icon: Briefcase, href: '/admin/projects' },
  { name: 'Compétences', icon: Award, href: '/admin/skills' },
  { name: 'Messages', icon: Mail, href: '/admin/messages' },
  { name: 'Contenu', icon: FileText, href: '/admin/content' },
  { name: 'Paramètres', icon: Settings, href: '/admin/settings' },
]

export default function AdminLayout({
  children,
  title = 'Admin',
  description = "Espace d'administration",
  currentPath,
}: AdminLayoutProps) {
  const { auth } = usePage<InertiaProps>().props
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    router.post('/admin/auth/logout')
  }

  const goHome = () => {
    router.visit('/')
  }

  return (
    <>
      <HeadLayout title={`${title} - Admin Portfolio`} description={description} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Portfolio</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={goHome}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
              >
                <Home className="w-4 h-4" />
                Accueil
              </button>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{auth.user!.username}</p>
                  <p className="text-xs text-gray-500">{auth.user!.email}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getInitials(auth.user!.username)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:cursor-pointer hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              </div>

              {/* Navigation Menu */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPath === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group',
                        isActive
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5',
                          isActive ? 'text-blue-600' : 'group-hover:text-blue-600'
                        )}
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">Version 1.0.0</div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:ml-0">
            <div className="p-6">{children}</div>
          </main>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </>
  )
}
