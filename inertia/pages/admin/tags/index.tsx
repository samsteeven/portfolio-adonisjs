import React, { useState } from 'react'
import { Head, useForm, router, Link } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'
import {
  Plus,
  Tag as TagIcon,
  Edit,
  Trash2,
  Hash,
  FileText,
  Search,
  ChevronRight,
} from 'lucide-react'

interface Tag {
  id: number
  name: string
  slug: string
  color?: string
  description?: string
  blogPosts_count: number
}

interface TagsAdminProps {
  tags: Tag[]
}

export default function TagsAdmin({ tags }: TagsAdminProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    tagId: null as number | null,
    tagName: '',
    isLoading: false,
  })

  const { data, setData, post, patch, processing, errors, reset } = useForm({
    name: '',
    color: '#3B82F6',
    description: '',
  })

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingTag) {
      patch(`/admin/tags/${editingTag.id}`, {
        onSuccess: () => {
          reset()
          setEditingTag(null)
        },
      })
    } else {
      post('/admin/tags', {
        onSuccess: () => {
          reset()
          setShowCreateForm(false)
        },
      })
    }
  }

  const handleEdit = (tag: Tag) => {
    setData({
      name: tag.name,
      color: tag.color || '#3B82F6',
      description: tag.description || '',
    })
    setEditingTag(tag)
    setShowCreateForm(true)
  }

  const handleDelete = (id: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      tagId: id,
      tagName: name,
      isLoading: false,
    })
  }

  const confirmDelete = () => {
    if (!deleteModal.tagId) return

    setDeleteModal((prev) => ({ ...prev, isLoading: true }))

    router.delete(`/admin/tags/${deleteModal.tagId}`, {
      onSuccess: () => {
        setDeleteModal({
          isOpen: false,
          tagId: null,
          tagName: '',
          isLoading: false,
        })
      },
      onError: () => {
        setDeleteModal((prev) => ({ ...prev, isLoading: false }))
      },
    })
  }

  const cancelForm = () => {
    reset()
    setShowCreateForm(false)
    setEditingTag(null)
  }

  const getContrastColor = (hexColor: string) => {
    // Convertir hex en RGB
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)

    // Calculer la luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  return (
    <>
      <Head title="Gestion des tags - Admin" />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href={'/admin/blog'} className="hover:text-gray-700">
              Blog
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Tags</span>
          </nav>
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
                <p className="text-gray-600 mt-2">Gérez les tags pour organiser vos articles</p>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau tag
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TagIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total tags</p>
                    <p className="text-xl font-semibold">{tags.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Tags utilisés</p>
                    <p className="text-xl font-semibold">
                      {tags.filter((tag) => tag.blogPosts_count > 0).length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Hash className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Articles taggés</p>
                    <p className="text-xl font-semibold">
                      {tags.reduce((sum, tag) => sum + tag.blogPosts_count, 0)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Search */}
          <Card className="p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {editingTag ? 'Modifier le tag' : 'Créer un nouveau tag'}
                </h2>
                <Button variant="outline" className="border-none" onClick={cancelForm}>
                  Annuler
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nom du tag *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="React, JavaScript, Tutorial..."
                      className="mt-1"
                      required
                    />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="color" className="text-sm font-medium">
                      Couleur
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="color"
                        type="color"
                        value={data.color}
                        onChange={(e) => setData('color', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <div
                        className="flex-1 h-10 rounded border flex items-center justify-center text-sm font-medium"
                        style={{
                          backgroundColor: data.color,
                          color: getContrastColor(data.color),
                        }}
                      >
                        Aperçu
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Description du tag (optionnel)"
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={processing}>
                    {processing
                      ? 'Enregistrement...'
                      : editingTag
                        ? 'Mettre à jour'
                        : 'Créer le tag'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Tags List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <Card key={tag.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="inline-flex px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: tag.color || '#3B82F6',
                        color: getContrastColor(tag.color || '#3B82F6'),
                      }}
                    >
                      #{tag.name}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id, tag.name)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {tag.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tag.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Slug: {tag.slug}</span>
                    <span>{tag.blogPosts_count || 0} article(s)</span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'Aucun tag trouvé' : 'Aucun tag créé'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm
                      ? `Aucun tag ne correspond à "${searchTerm}"`
                      : 'Commencez par créer votre premier tag pour organiser vos articles.'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Créer votre premier tag
                    </Button>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Supprimer le tag"
        message="Cette action est irréversible. Le tag sera retiré de tous les articles associés."
        itemName={deleteModal.tagName}
        isLoading={deleteModal.isLoading}
      />
    </>
  )
}

TagsAdmin.layout = (page: React.ReactNode) => (
  <AdminLayout title="Tags" description="Gestion des tags" currentPath="/admin/blogs/tags">
    {page}
  </AdminLayout>
)
