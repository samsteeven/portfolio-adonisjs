import React, { useEffect, useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Edit3,
  Eye,
  Trash2,
  DollarSign,
  Calendar,
  Hash,
  Image as ImageIcon,
  FileText,
  Settings,
  Globe,
  EyeOff,
  Clock,
  Copy,
  GripVertical,
} from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '~/layout/AdminLayout'
import { router } from '@inertiajs/react'
import { ServiceType } from '~/types/services'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'

interface Props {
  service: ServiceType
}

export default function AdminServiceShow({ service }: Props) {
  const [isclient, setIsClient] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { delete: deleteService, processing: isDeleting } = useForm()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleDelete = () => {
    deleteService(`/admin/services/${service.id}`, {
      onSuccess: () => {
        toast.success('Service supprimé avec succès')
        setShowDeleteModal(false)
      },
      onError: () => {
        toast.error('Erreur lors de la suppression du service')
        setShowDeleteModal(false)
      },
    })
  }

  const toggleStatus = () => {
    router.patch(
      `/admin/services/${service.id}/toggle-status`,
      {},
      {
        onSuccess: () => {
          toast.success(`Service ${service.isActive ? 'désactivé' : 'activé'} avec succès`)
        },
        onError: () => {
          toast.error('Erreur lors de la modification du statut')
        },
      }
    )
  }

  const handleDuplicate = () => {
    router.post(
      `/admin/services/${service.id}/duplicate`,
      {},
      {
        onSuccess: () => {
          toast.success('Service dupliqué avec succès')
        },
        onError: () => {
          toast.error('Erreur lors de la duplication du service')
        },
      }
    )
  }

  const formatPrice = (price?: number | null) => {
    if (price === null || price === undefined || price === 0) return 'Sur devis'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const formatDate = (date: string) => {
    if (!isclient) return '...'
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <>
      <Head title={service.title} />

      <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <Link href={'/admin/services'}>
                <Button
                  variant="outline"
                  className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{service.title}</h1>
                  <Badge className={getStatusColor(service.isActive)}>
                    {service.isActive ? (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Actif</span>
                        <span className="sm:hidden">A</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Inactif</span>
                        <span className="sm:hidden">I</span>
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">Détails complets du service</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDuplicate}
                className="border-emerald-300 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"
              >
                <Copy className="h-4 w-4" />
              </Button>

              <Link href={`/admin/services/${service.id}/edit`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Edit3 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Modifier</span>
                  <span className="sm:hidden">Modif</span>
                </Button>
              </Link>

              <Button
                type="button"
                variant="outline"
                onClick={toggleStatus}
                className={`${
                  service.isActive
                    ? 'border-orange-300 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50'
                    : 'border-green-300 hover:border-green-400 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {service.isActive ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="border-red-300 hover:border-red-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Image */}
              {service.image && (
                <Card className="p-4 sm:p-6 border-0 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Image du service</h2>
                  </div>

                  <div className="relative">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-64 sm:h-80 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      Image principale
                    </div>
                  </div>
                </Card>
              )}

              {/* Service Description */}
              <Card className="p-4 sm:p-6 border-0 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Description détaillée
                  </h2>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                    {service.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    {service.description.length} caractère
                    {service.description.length > 1 ? 's' : ''}
                  </p>
                </div>
              </Card>

              {/* Quick Actions - Mobile Only */}
              <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 lg:hidden">
                <h3 className="font-bold text-gray-900 mb-4">Actions rapides</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/admin/services/${service.id}/edit`}>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    onClick={toggleStatus}
                    className={`w-full justify-start ${
                      service.isActive
                        ? 'border-orange-200 hover:border-orange-300 hover:bg-orange-50'
                        : 'border-green-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    {service.isActive ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Activer
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDuplicate}
                    className="w-full justify-start border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Dupliquer
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.visit('/services')}
                    className="w-full justify-start border-gray-200 hover:border-gray-300 hover:bg-gray-50 col-span-2"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir sur le site
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Service Status */}
              <Card
                className={`p-4 border-0 shadow-lg ${
                  service.isActive
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50'
                    : 'bg-gradient-to-br from-gray-50 to-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2 rounded-lg ${
                      service.isActive ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    {service.isActive ? (
                      <Globe className="h-5 w-5 text-green-600" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {service.isActive ? 'Service actif' : 'Service inactif'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {service.isActive
                        ? 'Visible par les visiteurs'
                        : 'Masqué du site public'}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={toggleStatus}
                  className={`w-full ${
                    service.isActive
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {service.isActive ? 'Désactiver' : 'Activer'}
                </Button>
              </Card>

              {/* Pricing Information */}
              <Card className="p-4 border-0 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Tarification</h3>
                </div>

                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatPrice(service.price)}
                  </div>
                  {service.price && service.price !== 0 && (
                    <p className="text-sm text-gray-500 mt-1">Prix affiché aux clients</p>
                  )}
                </div>
              </Card>

              {/* Service Settings */}
              <Card className="p-4 border-0 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Settings className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Paramètres</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ordre d'affichage :</span>
                    <Badge variant="outline" className="font-mono">
                      #{service.displayOrder}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Statut :</span>
                    <Badge className={getStatusColor(service.isActive)}>
                      {service.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => router.visit('/admin/services')}
                      className="w-full justify-start border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    >
                      <GripVertical className="h-4 w-4 mr-2" />
                      Réorganiser les services
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Service Information */}
              <Card className="p-4 border-0 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Hash className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Informations système</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ID du service :</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                      #{service.id}
                    </code>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Créé le :</span>
                    </div>
                    <p className="text-xs text-gray-800 bg-gray-50 p-2 rounded">
                      {formatDate(service.createdAt)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Modifié le :</span>
                    </div>
                    <p className="text-xs text-gray-800 bg-gray-50 p-2 rounded">
                      {formatDate(service.updatedAt)}
                    </p>
                  </div>

                  {service.updatedAt !== service.createdAt && (
                    <div className="pt-2 border-t border-gray-200">
                      <Badge variant="outline" className="text-xs">
                        Service modifié
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="p-4 border-0 shadow-lg border-red-200 bg-red-50/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="font-bold text-red-900">Zone de danger</h3>
                </div>

                <p className="text-sm text-red-700 mb-4">
                  La suppression de ce service est irréversible. Toutes les données seront perdues
                  définitivement.
                </p>

                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer définitivement
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer le service"
        message="Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible."
        itemName={service.title}
        isLoading={isDeleting}
      />
    </>
  )
}

AdminServiceShow.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Détails du Service"
    description="Visualisation complète d'un service"
    currentPath="/admin/services/show"
  >
    {page}
  </AdminLayout>
)