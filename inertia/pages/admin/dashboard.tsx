import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  FolderOpen,
  FileText,
  MessageSquare,
  Mail,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Activity,
  Calendar,
  Clock,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Plus,
  UserPlus,
  FolderPlus,
  FilePlus,
  MailPlus,
  MessageCircle,
  Lock,
  ArrowRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { toast } from 'sonner'
import AdminLayout from '~/layout/AdminLayout'

interface GrowthData {
  users: number
  projects: number
  blogPosts: number
  comments: number
  contactRequests: number
}

interface TopProject {
  id: number
  title: string
  isActive: boolean
  createdAt: string
}

interface RecentActivity {
  id: number
  type: string
  title: string
  createdAt: string
}

interface MonthlyData {
  month: string
  users: number
  projects: number
  blogPosts: number
}

interface DashboardStats {
  totalUsers: number
  totalProjects: number
  totalBlogPosts: number
  totalComments: number
  totalContactRequests: number
  recentUsers: number
  recentProjects: number
  recentBlogPosts: number
  recentComments: number
  recentContactRequests: number
  growth: GrowthData
  topProjects: TopProject[]
  recentActivity: RecentActivity[]
  monthlyData: MonthlyData[]
}

interface AdminDashboardProps {
  stats?: DashboardStats
  lastUpdated?: string
  isFromCache?: boolean
  error?: string
  isRestricted?: boolean
}

// Quick action buttons configuration
const quickActions = [
  {
    name: 'Ajouter utilisateur',
    icon: UserPlus,
    href: '/admin/users/create',
    color: 'bg-blue-500',
  },
  {
    name: 'Ajouter projet',
    icon: FolderPlus,
    href: '/admin/projects/create',
    color: 'bg-purple-500',
  },
  { name: 'Ajouter article', icon: FilePlus, href: '/admin/blog/create', color: 'bg-green-500' },
  { name: 'Ajouter service', icon: Plus, href: '/admin/services/create', color: 'bg-indigo-500' },
  { name: 'Voir demandes', icon: MailPlus, href: '/admin/contact-requests', color: 'bg-red-500' },
  {
    name: 'Voir commentaires',
    icon: MessageCircle,
    href: '/admin/comments',
    color: 'bg-yellow-500',
  },
]

export default function AdminDashboard({
  stats,
  lastUpdated,
  isFromCache = false,
  error,
  isRestricted = false,
}: AdminDashboardProps) {
  // If user doesn't have admin rights, show restricted view
  if (isRestricted) {
    return (
      <>
        <Head title="Dashboard Admin" />
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <Card className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès restreint</h2>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas les permissions nécessaires pour accéder aux statistiques du tableau
                de bord.
              </p>
              <Link href={'/admin/users'}>
                <Button>
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </>
    )
  }

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentStats, setCurrentStats] = useState<DashboardStats>(stats!)
  const [isclient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Auto-refresh toutes les 5 minutes
  useEffect(() => {
    // Only set up auto-refresh if stats exist
    if (!stats) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/admin/dashboard/api')
        const data = await response.json()
        if (data.success && data.data) {
          setCurrentStats(data.data)
        }
      } catch (error) {
        console.error('Erreur refresh automatique:', error)
      }
    }, 300000)

    return () => clearInterval(interval)
  }, [stats])

  const handleRefresh = async () => {
    if (!stats) return

    setIsRefreshing(true)
    try {
      const response = await fetch('/admin/dashboard/stats/refresh')
      const data = await response.json()
      if (data.success) {
        setCurrentStats(data.data)
        toast.success(data.message)
        setIsRefreshing(false)
      }
    } catch (e) {
      toast.error('Erreur lors de la mise à jour des données')
      setIsRefreshing(false)
    }
  }

  const formatGrowth = (value: number) => {
    const isPositive = value >= 0
    return {
      value: Math.abs(value),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      colorClass: isPositive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100',
    }
  }

  const formatDate = (date: string) => {
    if (!isclient) return '...'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return FolderOpen
      case 'blog':
        return FileText
      case 'comment':
        return MessageSquare
      case 'contact':
        return Mail
      default:
        return Activity
    }
  }

  const getActivityTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      project: 'Projet',
      blog: 'Article',
      comment: 'Commentaire',
      contact: 'Contact',
    }
    return labels[type] || 'Activité'
  }

  const statCards = stats
    ? [
        {
          title: 'Utilisateurs',
          total: currentStats.totalUsers,
          recent: currentStats.recentUsers,
          growth: currentStats.growth.users,
          icon: Users,
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
        },
        {
          title: 'Projets',
          total: currentStats.totalProjects,
          recent: currentStats.recentProjects,
          growth: currentStats.growth.projects,
          icon: FolderOpen,
          bgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
        },
        {
          title: 'Articles',
          total: currentStats.totalBlogPosts,
          recent: currentStats.recentBlogPosts,
          growth: currentStats.growth.blogPosts,
          icon: FileText,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
        },
        {
          title: 'Commentaires',
          total: currentStats.totalComments,
          recent: currentStats.recentComments,
          growth: currentStats.growth.comments,
          icon: MessageSquare,
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
        },
        {
          title: 'Contacts',
          total: currentStats.totalContactRequests,
          recent: currentStats.recentContactRequests,
          growth: currentStats.growth.contactRequests,
          icon: Mail,
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
        },
      ]
    : []

  return (
    <>
      <Head title="Dashboard Admin" />

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
              <p className="text-gray-600">Vue d'ensemble de votre portfolio</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {error && (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {isFromCache && (
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  <Clock className="h-3 w-3 mr-1" />
                  Cache
                </Badge>
              )}

              {lastUpdated && (
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  MAJ: {formatDate(lastUpdated)}
                </span>
              )}

              {stats && (
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon
                return (
                  <Link key={index} href={action.href}>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full border-0 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm">
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2 shadow-sm`}
                        >
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xs font-medium text-gray-700 leading-tight">{action.name}</h3>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {statCards.map((stat, index) => {
                const growth = formatGrowth(stat.growth)
                const IconComponent = stat.icon
                const GrowthIcon = growth.icon

                return (
                  <Card key={index} className="p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                      </div>
                      {stat.growth !== 0 && (
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg ${growth.colorClass}`}
                        >
                          <GrowthIcon className="h-3 w-3" />
                          <span className="text-xs font-medium">{growth.value}%</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                        {stat.total.toLocaleString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                      {stat.recent > 0 && (
                        <p className="text-xs text-blue-600">+{stat.recent} cette semaine</p>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Graphique des tendances */}
              <Card className="lg:col-span-2 p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Évolution mensuelle</h3>
                </div>

                <div className="overflow-x-auto">
                  <div className="h-72 sm:h-80 md:h-96 min-w-[600px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentStats.monthlyData}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="users"
                          stroke="#3B82F6"
                          fillOpacity={1}
                          fill="url(#colorUsers)"
                          name="Utilisateurs"
                        />
                        <Area
                          type="monotone"
                          dataKey="projects"
                          stroke="#8B5CF6"
                          fillOpacity={1}
                          fill="url(#colorProjects)"
                          name="Projets"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>

              {/* Activité récente */}
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {currentStats.recentActivity.length > 0 ? (
                    currentStats.recentActivity.map((activity) => {
                      const IconComponent = getActivityIcon(activity.type)

                      return (
                        <div
                          key={`${activity.type}-${activity.id}`}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <IconComponent className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {getActivityTypeLabel(activity.type)}
                              </Badge>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatDate(activity.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Aucune activité récente</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Projets récents */}
          {stats && (
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Projets récents</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentStats.topProjects.length > 0 ? (
                  currentStats.topProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-lg font-semibold">
                        {project.id}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">{project.title}</h4>
                          {project.isActive ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full bg-gray-300 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span className="truncate">{formatDate(project.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun projet trouvé</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

AdminDashboard.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Dashboard"
    description="Vue d'ensemble de votre portfolio"
    currentPath="/admin/dashboard"
  >
    {page}
  </AdminLayout>
)
