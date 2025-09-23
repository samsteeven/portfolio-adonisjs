import AdminLayout from '~/layout/AdminLayout'
import { cn } from '@/utils'
import {
  Users,
  FileText,
  Mail,
  TrendingUp,
  Calendar,
  Eye,
  MessageSquare,
  Award,
} from 'lucide-react'
import React from 'react'

export default function Dashboard() {
  const stats = [
    { name: 'Visiteurs', value: '1,234', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { name: 'Projets', value: '24', change: '+3', icon: FileText, color: 'bg-green-500' },
    { name: 'Messages', value: '89', change: '+5', icon: Mail, color: 'bg-purple-500' },
    {
      name: 'Taux de conversion',
      value: '3.2%',
      change: '+0.8%',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ]

  const recentActivities = [
    { id: 1, action: 'Nouveau message reçu', time: 'Il y a 5 min', type: 'message' },
    { id: 2, action: 'Projet "E-commerce" mis à jour', time: 'Il y a 1h', type: 'project' },
    { id: 3, action: 'Nouveau visiteur sur le portfolio', time: 'Il y a 2h', type: 'visitor' },
    { id: 4, action: 'Compétence "React" ajoutée', time: 'Il y a 3h', type: 'skill' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bienvenue dans votre espace d'administration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={cn('p-3 rounded-lg', stat.color)}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
              <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activités récentes</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    activity.type === 'message'
                      ? 'bg-purple-500'
                      : activity.type === 'project'
                        ? 'bg-green-500'
                        : activity.type === 'visitor'
                          ? 'bg-blue-500'
                          : 'bg-orange-500'
                  )}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Nouveau projet</span>
            </button>

            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Ajouter compétence</span>
            </button>

            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Voir messages</span>
            </button>

            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Aperçu site</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendrier</h3>
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun événement prévu</p>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">État du système</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Serveur</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Opérationnel
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base de données</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connectée
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dernière sauvegarde</span>
              <span className="text-sm text-gray-900">Il y a 2h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

Dashboard.layout = (page: React.ReactNode) => {
  return (
    <AdminLayout
      title="Dashboard"
      description="Vue d'ensemble de mon portfolio"
      currentPath="/admin/dashboard"
    >
      {page}
    </AdminLayout>
  )
}
