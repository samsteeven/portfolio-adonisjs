import React, { useEffect, useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ConfirmationModal from '~/components/ConfirmationModal'
import {
  ArrowLeft,
  Edit,
  EyeOff,
  Calendar,
  User,
  Clock,
  Tag as TagIcon,
  ChevronRight,
  Share2,
  BookOpen,
  Settings,
  CheckCircle2,
  TimerReset as Schedule,
  ExternalLink,
  Trash2,
  Globe,
} from 'lucide-react'
import SafeHTML from '~/components/safeHTML'

interface BlogShowAdminProps {
  post: BlogPost
}

export default function BlogShowAdmin({ post }: BlogShowAdminProps) {
  const [isclient, setIsClient] = useState(false)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  })
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    isLoading: false,
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDate = (dateString: string) => {
    if (!isclient) return '...'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const readingTime = (text: string) => {
    const wordsPerMinute = 200
    const words = text.split(' ').length
    return Math.ceil(words / wordsPerMinute)
  }

  const getContrastColor = (hexColor: string) => {
    if (!hexColor) return '#FFFFFF'
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  const getStatusInfo = (published: boolean, publishedAt?: string) => {
    if (!published && publishedAt && new Date(publishedAt) > new Date()) {
      return {
        text: 'Programmé',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Schedule,
        iconColor: 'text-blue-500',
      }
    }
    if (!published) {
      return {
        status: 'Brouillon',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: EyeOff,
        iconColor: 'text-gray-500',
      }
    }
    return {
      status: 'Publié',
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircle2,
      iconColor: 'text-green-500',
    }
  }

  const handleDelete = () => {
    setDeleteModal({
      isOpen: true,
      isLoading: false,
    })
  }

  const confirmDelete = async () => {
    setDeleteModal((prev) => ({ ...prev, isLoading: true }))

    router.delete(`/admin/blog/${post.id}`, {
      onError: () => {
        setDeleteModal((prev) => ({ ...prev, isLoading: false }))
      },
    })
  }

  const handleToggleStatus = () => {
    setStatusModal({
      isOpen: true,
      isLoading: false,
    })
  }

  const confirmToggleStatus = async () => {
    setStatusModal((prev) => ({ ...prev, isLoading: true }))

    router.patch(
      `/admin/blog/${post.id}/toggle-status`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          setStatusModal((prev) => ({ ...prev, isOpen: false, isLoading: false }))
        },
        onError: () => {
          setStatusModal((prev) => ({ ...prev, isLoading: false }))
        },
      }
    )
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${post.slug}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: url,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(url)
      } catch (err) {
        console.error('Failed to copy: ', err)
      }
    }
  }

  const statusInfo = getStatusInfo(post.published, post.publishedAt)

  return (
    <>
      <Head title={`${post.title} - Admin`} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-6">
          {/* Header responsive */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 sm:mb-6">
              <Link href={'/admin/blog'} className="hover:text-blue-600 transition-colors">
                Blog
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Prévisualisation</span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <Link href={'/admin/blog'}>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                </Link>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 break-words">
                    {post.title}
                  </h1>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {Boolean(post.published) && (
                  <Link href={`/blog/${post.slug}`} target="_blank" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-200 hover:border-blue-300"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Voir en ligne
                    </Button>
                  </Link>
                )}
                <Link href={`/admin/blog/${post.id}/edit`} className="w-full sm:w-auto">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Contenu principal */}
            <div className="xl:col-span-2 space-y-6">
              {/* Image mise en avant */}
              {post.photoPathPublicUrl && (
                <Card className="overflow-hidden border-0 shadow-sm">
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={post.photoPathPublicUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Card>
              )}

              {/* Contenu de l'article */}
              <Card className="border-0 shadow-sm">
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Contenu de l'article
                    </h2>
                  </div>

                  <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                    <SafeHTML
                      html={post.content}
                      className="text-gray-600 text-sm sm:text-base line-clamp-10"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statut et actions */}
              <Card className="border-0 shadow-sm">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="font-semibold text-gray-900">Statut</h3>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}
                    >
                      <statusInfo.icon className={`w-4 h-4 ${statusInfo.iconColor}`} />
                      {statusInfo.status}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">Par</span>
                      <span className="font-medium text-gray-900 truncate">
                        {post.author.username}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 break-words">
                        {post.published &&
                        post.publishedAt &&
                        new Date(post.publishedAt) < new Date()
                          ? `Publié le ${formatDate(post.publishedAt)}`
                          : !post.published && post.publishedAt
                            ? `Sera publié a ${formatDate(post.publishedAt)}`
                            : `Créé le ${formatDate(post.createdAt)}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">
                        {readingTime(post.content)} min de lecture
                      </span>
                    </div>

                    {post.updatedAt !== post.createdAt && (
                      <div className="flex items-start gap-3 text-sm">
                        <Settings className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 break-words">
                          Modifié le {formatDate(post.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Tags */}
              {post.tags.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TagIcon className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Tags ({post.tags.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm break-all"
                          style={{
                            backgroundColor: tag.color || '#3B82F6',
                            color: getContrastColor(tag.color || '#3B82F6'),
                          }}
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* URL et partage */}
              <Card className="border-0 shadow-sm">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Share2 className="w-4 h-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Partager</h3>
                  </div>

                  <div className="space-y-3">
                    {post.published ? (
                      <Button
                        onClick={handleShare}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!isclient}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Partager l'article
                      </Button>
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-3">
                        L'article doit être publié pour être partagé
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Actions rapides */}
              <Card className="border-0 shadow-sm">
                <div className="p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleStatus}
                      className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      {post.published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                      {post.published ? 'Dépublier' : 'Publier'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Supprimer l'article"
        message="Cette action est irréversible. L'article et tous ses commentaires seront définitivement supprimés."
        itemName={post.title}
        isLoading={deleteModal.isLoading}
      />

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmToggleStatus}
        title={post.published ? "Dépublier l'article" : "Publier l'article"}
        message={
          post.published
            ? 'Êtes-vous sûr de vouloir dépublier cet article ? Il ne sera plus visible publiquement.'
            : 'Êtes-vous sûr de vouloir publier cet article ? Il sera visible publiquement.'
        }
        actionType={post.published ? 'deactivate' : 'activate'}
        itemName={post.title}
        isLoading={statusModal.isLoading}
      />
    </>
  )
}

BlogShowAdmin.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Prévisualisation article"
    description="Prévisualiser l'article de blog"
    currentPath="/admin/blog"
  >
    {page}
  </AdminLayout>
)
