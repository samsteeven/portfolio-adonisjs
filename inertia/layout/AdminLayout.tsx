import React, { useEffect, useMemo, useState } from 'react'
import { HeadLayout } from './HeadLayout'
import { usePage, Link, router } from '@inertiajs/react'
import { InertiaProps } from '~/types'
import { cn } from '@/utils'
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  Mail,
  Briefcase,
  Award,
  Cpu,
  Search,
  Bell,
  Settings,
  ChevronDown,
  Home,
} from 'lucide-react'
import { getInitials } from '~/utils/utils_string'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { Toaster as Sonner } from '@/components/ui/sonner'
import '~/css/admin.css'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  currentPath?: string
}

const adminMenuItems = [
  { name: 'Dashboard', icon: Home, href: '/admin/dashboard', badge: null },
  { name: 'Utilisateurs', icon: Users, href: '/admin/users' },
  { name: 'Projets', icon: Briefcase, href: '/admin/projects', badge: null },
  { name: 'Compétences', icon: Award, href: '/admin/skills', badge: null },
  { name: 'Technologies', icon: Cpu, href: '/admin/technologies', badge: null },
  { name: 'Contacts', icon: Mail, href: '/admin/contacts', badge: '3' },
]

export default function AdminLayout({
  children,
  title = 'Admin',
  description = "Espace d'administration",
  currentPath,
}: AdminLayoutProps) {
  const page = usePage<InertiaProps>()
  const { props, url } = page
  const { auth } = props
  const activePath = useMemo(() => currentPath || url, [currentPath, url])

  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [mobileBaselineY, setMobileBaselineY] = useState<number | null>(null)
  const [isScrollCloseArmed, setIsScrollCloseArmed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  //toasts
  useEffect(() => {
    const { error, success } = props || {}

    if (success) toast.success(success)

    if (error) toast.error(error)
  }, [props.error, props.success])

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || 0
      if (isMobileNavOpen) {
        setIsHeaderHidden(false)
        setLastScrollY(currentY)
        return
      }
      const isScrollingDown = currentY > lastScrollY
      if (isScrollingDown && currentY > 64) {
        setIsHeaderHidden(true)
      } else {
        setIsHeaderHidden(false)
      }
      setLastScrollY(currentY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isMobileNavOpen])

  useEffect(() => {
    if (!isMobileNavOpen) return
    setIsScrollCloseArmed(false)
    const baseline = window.scrollY || 0
    setMobileBaselineY(baseline)
    const armId = setTimeout(() => setIsScrollCloseArmed(true), 500)

    const closeOnScroll = () => {
      if (!isScrollCloseArmed) return
      const currentY = window.scrollY || 0
      const delta = Math.abs(currentY - (mobileBaselineY ?? baseline))
      if (delta > 80) {
        setIsMobileNavOpen(false)
        setIsScrollCloseArmed(false)
      }
    }
    window.addEventListener('scroll', closeOnScroll, { passive: true })
    return () => {
      clearTimeout(armId)
      window.removeEventListener('scroll', closeOnScroll)
    }
  }, [isMobileNavOpen, isScrollCloseArmed, mobileBaselineY])

  useEffect(() => {
    const handleClickOutside = () => {
      setIsUserMenuOpen(false)
    }
    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const handleLogout = () => {
    router.post('/admin/auth/logout')
  }

  const filteredMenuItems = adminMenuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <HeadLayout title={`${title} - Admin Portfolio`} description={description} />
      <Sonner className="text-black bg-gray-200" position="top-center" />
      <div className="min-h-screen transition-colors duration-300 bg-neutral-50">
        {/* Header - Layout optimisé */}
        <header
          className={cn(
            'sticky top-0 z-50 transition-all duration-300',
            'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm',
            isHeaderHidden ? '-translate-y-full' : 'translate-y-0'
          )}
        >
          <div className="w-full px-4 lg:px-6">
            <div className="flex items-center justify-between py-4">
              {/* Section gauche - Logo + Menu burger groupés */}
              <div className="flex items-center gap-3">
                {/* Menu burger sur mobile */}
                <button
                  onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                  aria-label="Navigation mobile"
                  className={cn(
                    'flex md:hidden p-2 rounded-lg text-gray-600 transition-all duration-200',
                    'hover:bg-gray-100 active:scale-95',
                    isMobileNavOpen && 'bg-gray-100'
                  )}
                >
                  <motion.div
                    animate={{ rotate: isMobileNavOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </button>

                {/* Logo et titre - Plus compacts */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shadow-inner">
                    <LayoutDashboard className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-semibold tracking-tight text-gray-900">
                      Admin Portfolio
                    </h1>
                    <p className="text-xs text-gray-500">Tableau de bord</p>
                  </div>
                </div>
              </div>

              {/* Section centre - Recherche élargie */}
              <div className="hidden lg:flex flex-1 justify-center px-8">
                <div className="relative w-full max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher dans l'admin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      'w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm',
                      'placeholder:text-gray-500 text-gray-900',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                      'transition-all duration-200'
                    )}
                  />
                </div>
              </div>

              {/* Section droite - Actions utilisateur */}
              <div className="flex items-center gap-2">
                {/* Actions rapides */}
                <div className="hidden sm:flex items-center gap-1">
                  {/* Recherche mobile uniquement pour tablettes */}
                  <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Search className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Notifications avec badge dynamique */}
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative group">
                    <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white">
                      <span className="sr-only">Notifications</span>
                    </span>
                  </button>

                  {/* Bouton settings rapide */}
                  <Link
                    href={'/admin/settings'}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <Settings className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                  </Link>
                </div>

                {/* Séparateur visuel */}
                <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1"></div>

                {/* Menu utilisateur élargi */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsUserMenuOpen(!isUserMenuOpen)
                    }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                      'hover:bg-gray-100 active:scale-98',
                      isUserMenuOpen && 'bg-gray-100'
                    )}
                  >
                    {/* Avatar plus grand */}
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-sm font-semibold text-white">
                        {getInitials(auth!.user.username)}
                      </span>
                    </div>

                    {/* Info utilisateur - Visible dès md */}
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[120px] xl:max-w-[140px]">
                        {auth!.user.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[120px] xl:max-w-[140px]">
                        {auth!.user.email}
                      </p>
                    </div>

                    {/* Flèche */}
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-gray-400 transition-transform duration-200',
                        isUserMenuOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {/* Dropdown menu amélioré */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          'absolute right-0 mt-2 w-56 rounded-xl shadow-xl border',
                          'bg-white backdrop-blur-xl border-gray-200',
                          'py-2 z-50'
                        )}
                      >
                        {/* Info user pour mobile */}
                        <div className="md:hidden px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-white">
                                {getInitials(auth!.user.username)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {auth!.user.username}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{auth!.user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                          <Link
                            href={'/admin/settings/profile'}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Mon profil
                          </Link>

                          <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left">
                            <Bell className="w-4 h-4" />
                            <span>Notifications</span>
                            <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              3
                            </span>
                          </button>
                        </div>

                        <hr className="my-1 border-gray-100" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:cursor-pointer hover:text-red-700 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation horizontale - Plus spacieuse */}
          <div className="hidden md:block w-full px-4 lg:px-6 pb-4">
            <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
              {(searchQuery ? filteredMenuItems : adminMenuItems).map((item) => {
                const Icon = item.icon
                const isActive = activePath?.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'relative inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm whitespace-nowrap font-medium',
                      'transition-all duration-200 active:scale-95 flex-shrink-0',
                      isActive
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-600/25'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {item.name === 'Utilisateurs' && (
                      <span
                        className={cn(
                          'ml-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                          isActive ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        )}
                      >
                        {auth!.usersCount}
                      </span>
                    )}
                    {item.name === 'Projets' && (
                      <span
                        className={cn(
                          'ml-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                          isActive ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        )}
                      >
                        {auth!.projectsCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Navigation mobile */}
          <AnimatePresence>
            {isMobileNavOpen && (
              <motion.div
                key="mobile-nav"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="md:hidden border-t border-gray-200 bg-gray-50/80 backdrop-blur-xl"
              >
                <div className="px-4 py-4">
                  {/* Recherche mobile */}
                  <div className="relative mb-4">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        'w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm',
                        'placeholder:text-gray-500 text-gray-900',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      )}
                    />
                  </div>

                  {/* Navigation mobile */}
                  <nav className="space-y-1">
                    {(searchQuery ? filteredMenuItems : adminMenuItems).map((item) => {
                      const Icon = item.icon
                      const isActive = activePath?.startsWith(item.href)
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            'flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200',
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                          )}
                          onClick={() => setIsMobileNavOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={cn(
                                'px-2 py-1 rounded-full text-xs font-semibold',
                                isActive ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Contenu principal */}
        <main className="relative">
          <div className="w-full px-4 lg:px-6 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-sm border shadow-sm transition-all duration-300 bg-white border-gray-200"
            >
              <div className="p-6 lg:p-8">{children}</div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Overlay pour fermer les menus */}
      {(isMobileNavOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => {
            setIsMobileNavOpen(false)
            setIsUserMenuOpen(false)
          }}
        />
      )}
    </>
  )
}
