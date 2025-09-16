import React, { useState, useMemo, useEffect } from 'react'
import { Link, router } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Tag,
  FileText,
  Clock,
  Globe,
  EyeOff,
  X,
  Grid3X3,
  List,
  TrendingUp,
  TimerResetIcon as Schedule,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

interface PostBlog extends BlogPost {
  _count?: {
    views?: number
    comments?: number
  }
}

interface BlogPostsIndexProps {
  posts: {
    data: PostBlog[]
    meta: {
      currentPage: number
      lastPage: number
      total: number
    }
  }
  filters: {
    search?: string
    status?: string
    author?: string
  }
}

export default function BlogPostsIndex({ posts, filters }: BlogPostsIndexProps) {
  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    postId: null as number | null,
    postTitle: '',
    isLoading: false,
  })
  const [isclient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Filtrage côté client
  const filteredPosts = useMemo(() => {
    let filtered = [...posts.data]

    // Filtrage par recherche
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt.toLowerCase().includes(searchLower) ||
          post.author.username.toLowerCase().includes(searchLower) ||
          post.tags.some((tag) => tag.name.toLowerCase().includes(searchLower))
      )
    }

    // Filtrage par statut
    if (status) {
      switch (status) {
        case 'published':
          filtered = filtered.filter(
            (post) =>
              post.published && (!post.publishedAt || new Date(post.publishedAt) <= new Date())
          )
          break
        case 'draft':
          filtered = filtered.filter((post) => !post.published)
          break
        case 'scheduled':
          filtered = filtered.filter(
            (post) => !post.published && post.publishedAt && new Date(post.publishedAt) > new Date()
          )
          break
      }
    }

    return filtered
  }, [posts.data, search, status])

  const formatDate = (dateString: string) => {
    if (!isclient) return '...'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
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
        text: 'Brouillon',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: AlertCircle,
        iconColor: 'text-gray-500',
      }
    }
    return {
      text: 'Publié',
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircle2,
      iconColor: 'text-green-500',
    }
  }

  const resetFilters = () => {
    setSearch('')
    setStatus('')
  }

  const handleDelete = (id: number, title: string) => {
    setDeleteModal({
      isOpen: true,
      postId: id,
      postTitle: title,
      isLoading: false,
    })
  }

  const confirmDelete = async () => {
    if (!deleteModal.postId) return

    setDeleteModal((prev) => ({ ...prev, isLoading: true }))

    router.delete(`/admin/blog/${deleteModal.postId}`, {
      onSuccess: () => {
        setDeleteModal({
          isOpen: false,
          postId: null,
          postTitle: '',
          isLoading: false,
        })
      },
      onError: () => {
        setDeleteModal((prev) => ({ ...prev, isLoading: false }))
      },
    })
  }

  const stats = useMemo(
    () => ({
      total: posts.data.length,
      published: posts.data.filter(
        (p) => p.published && (!p.publishedAt || new Date(p.publishedAt) <= new Date())
      ).length,
      drafts: posts.data.filter((p) => !p.published).length,
      scheduled: posts.data.filter(
        (p) => !p.published && p.publishedAt && new Date(p.publishedAt) > new Date()
      ).length,
    }),
    [posts.data]
  )

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Articles de blog</h1>
                <p className="text-gray-600 mt-1">Gérez vos articles et publications</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={'/admin/tags'}>
                  <Button variant="outline" className="w-full sm:w-auto border-none">
                    <Tag className="w-4 h-4 mr-2" />
                    Gérer les tags
                  </Button>
                </Link>
                <Link href={`/blog`} target="_blank" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full border-gray-200 hover:border-blue-300"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Voir en ligne
                  </Button>
                </Link>
                <Link href={'/admin/blog/create'}>
                  <Button className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvel article
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Card className="p-4 border-0 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total</p>
                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-0 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Publiés</p>
                    <p className="text-xl font-bold text-gray-900">{stats.published}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-0 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <EyeOff className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Brouillons</p>
                    <p className="text-xl font-bold text-gray-900">{stats.drafts}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-0 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Programmés</p>
                    <p className="text-xl font-bold text-gray-900">{stats.scheduled}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Filters & Controls */}
          <Card className="p-4 sm:p-6 mb-6 border-0 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher par titre, contenu, auteur, tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full lg:w-48">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="published">Publiés</option>
                  <option value="draft">Brouillons</option>
                  <option value="scheduled">Programmés</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg p-1 bg-gray-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Clear Filters */}
              {(search || status) && (
                <Button onClick={resetFilters} variant="outline" className="w-full lg:w-auto">
                  <Filter className="w-4 h-4 mr-2" />
                  Effacer
                </Button>
              )}
            </div>

            {/* Active filters */}
            {(search || status) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">Filtres actifs:</span>
                {search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    "{search}"
                    <button onClick={() => setSearch('')} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {status && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {status === 'published'
                      ? 'Publiés'
                      : status === 'draft'
                        ? 'Brouillons'
                        : 'Programmés'}
                    <button onClick={() => setStatus('')} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </Card>

          {/* Results count */}
          {(search || status) && (
            <div className="mb-4 text-sm text-gray-600">
              {filteredPosts.length} résultat{filteredPosts.length > 1 ? 's' : ''}
              {filteredPosts.length !== posts.data.length && ` sur ${posts.data.length}`}
            </div>
          )}

          {/* Posts Grid/List */}
          {filteredPosts.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredPosts.map((post) => {
                const statusInfo = getStatusInfo(post.published, post.publishedAt)

                return viewMode === 'grid' ? (
                  /* Grid Card */
                  <Card
                    key={post.id}
                    className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm overflow-hidden"
                  >
                    {/* Image */}
                    {post.photoPathPublicUrl && (
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        <img
                          src={post.photoPathPublicUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}

                    <div className="p-5">
                      {/* Status & Date */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                        >
                          <statusInfo.icon className={`w-3 h-3 ${statusInfo.iconColor}`} />
                          {statusInfo.text}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(post.publishedAt || post.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        <Link href={`/admin/blog/${post.id}`}>{post.title}</Link>
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.author.username}
                        </div>
                        {post.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {post.tags.length}
                          </div>
                        )}
                        {post._count?.views && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post._count.views}
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag.slug}
                              className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              #{tag.name}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="text-xs text-gray-400 px-2 py-1">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>

                        <div className="flex items-center gap-1">
                          <Link
                            as="button"
                            method="patch"
                            href={`/admin/blog/${post.id}/toggle-status`}
                            preserveScroll
                            className={`p-1.5 rounded transition-colors ${
                              post.published
                                ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={post.published ? 'Dépublier' : 'Publier'}
                          >
                            {post.published ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Globe className="w-4 h-4" />
                            )}
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  /* List Item */
                  <Card
                    key={post.id}
                    className="p-4 sm:p-6 hover:shadow-md transition-shadow border-0 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image */}
                      {post.photoPathPublicUrl && (
                        <div className="w-full sm:w-32 h-32 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={post.photoPathPublicUrl}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900 truncate">
                              <Link href={`/admin/blog/${post.id}`} className="hover:text-blue-600">
                                {post.title}
                              </Link>
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                            >
                              <statusInfo.icon className={`w-3 h-3 ${statusInfo.iconColor}`} />
                              {statusInfo.text}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/admin/blog/${post.id}`}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/blog/${post.id}/edit`}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <Link
                              as="button"
                              method="patch"
                              href={`/admin/blog/${post.id}/toggle-status`}
                              preserveScroll
                              className={`p-2 rounded transition-colors ${
                                post.published
                                  ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {post.published ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Globe className="w-4 h-4" />
                              )}
                            </Link>
                            <button
                              onClick={() => handleDelete(post.id, post.title)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.author.username}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.publishedAt || post.createdAt)}
                          </div>
                          {post.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {post.tags.length} tag(s)
                            </div>
                          )}
                          {post._count?.views && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {post._count.views} vues
                            </div>
                          )}
                        </div>

                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag.slug}
                                className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                #{tag.name}
                              </span>
                            ))}
                            {post.tags.length > 4 && (
                              <span className="text-xs text-gray-400 px-2 py-1">
                                +{post.tags.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            /* Empty State */
            <Card className="p-12 text-center border-0 shadow-sm">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {search || status ? 'Aucun résultat trouvé' : 'Aucun article'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {search || status
                  ? 'Aucun article ne correspond à vos critères. Essayez de modifier vos filtres.'
                  : 'Commencez par créer votre premier article pour voir vos publications ici.'}
              </p>
              {search || status ? (
                <Button onClick={resetFilters} variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Effacer les filtres
                </Button>
              ) : (
                <Link href={'/admin/blog/create'}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer votre premier article
                  </Button>
                </Link>
              )}
            </Card>
          )}

          {/* Results Summary */}
          {filteredPosts.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Affichage de <span className="font-medium">{filteredPosts.length}</span> article
                {filteredPosts.length > 1 ? 's' : ''}
                {filteredPosts.length !== posts.data.length && (
                  <span>
                    {' '}
                    sur <span className="font-medium">{posts.data.length}</span>
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Supprimer l'article"
        message="Cette action est irréversible. L'article et tous ses commentaires seront définitivement supprimés."
        itemName={deleteModal.postTitle}
        isLoading={deleteModal.isLoading}
      />
    </>
  )
}

BlogPostsIndex.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Articles de blog"
    description="Gestion des articles et publications"
    currentPath="/admin/blog"
  >
    {page}
  </AdminLayout>
)
