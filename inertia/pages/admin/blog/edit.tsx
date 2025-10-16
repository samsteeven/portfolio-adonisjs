import React from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Save,
  ArrowLeft,
  Upload,
  X,
  Eye,
  ExternalLink,
  Calendar,
  Image as ImageIcon,
  Tag as TagIcon,
} from 'lucide-react'
import { formatDateTimeLocal, generateSlug } from '~/utils/utils_string'
import TinyMCEEditor from '~/components/TinyMCEEditor'
import { useImageUpload } from '~/utils/hooks/use_image_upload'
import { toast } from 'sonner'

interface EditProps {
  post: BlogPost
  tags: Tag[]
}

export default function EditBlogPost({ post, tags }: EditProps) {
  const { data, setData, patch, processing, errors, isDirty, transform } = useForm({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featuredImage: null as File | null,
    featuredImageUrl: post.photoPathPublicUrl === post.featuredImage ? post.featuredImage : null,
    published: post.published,
    publishedAt: post.publishedAt || '',
    tags: post.tags.map((tag) => tag.id),
  })

  // Utilisation du hook useImageUpload avec l'image existante
  const {
    preview: imagePreview,
    dragActive,
    fileInputRef,
    handleDrop,
    handleDrag,
    handleInputChange,
    removeImage: removeImagePreview,
    handleContainerClick,
  } = useImageUpload({
    maxSize: 5,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    initialPreview: post.photoPathPublicUrl || null, // Image existante
    onImageChange: (file) => {
      setData((prevData) => ({
        ...prevData,
        featuredImage: file,
        featuredImageUrl: file ? '' : prevData.featuredImageUrl,
      }))
    },
    onError: (error) => toast.error(error),
  })

  const handleTitleChange = (title: string) => {
    setData((prevData) => ({
      ...prevData,
      title,
      slug: generateSlug(title),
    }))
  }

  const handleImageUrlChange = (url: string) => {
    setData((prevData) => ({
      ...prevData,
      featuredImageUrl: url,
      featuredImage: null,
    }))
  }

  const removeImage = () => {
    removeImagePreview()
    setData((prevData) => ({
      ...prevData,
      featuredImage: null,
      featuredImageUrl: '',
    }))
  }

  const toggleTag = (tagId: number) => {
    const currentTags = data.tags
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId]

    setData('tags', newTags)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    transform((formData) => ({
      ...formData,
      publishedAt: formData.publishedAt
        ? new Date(formData.publishedAt).toISOString().slice(0, 19).replace('T', ' ')
        : null,
    }))

    patch(`/admin/blog/${post.id}`, {
      preserveScroll: true,
    })
  }

  // Détermine la source et l'aperçu de l'image
  const imageSource = data.featuredImage ? 'file' : data.featuredImageUrl ? 'url' : null
  const displayPreview = imagePreview || data.featuredImageUrl || post.photoPathPublicUrl

  return (
    <>
      <Head title={`Modifier "${post.title}" - Admin`} />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={'/admin/blog'}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Modifier l'article</h1>
              </div>

              <div className="flex items-center gap-3">
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <Button variant="outline" size="sm" className="border-none">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Prévisualiser
                  </Button>
                </Link>
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Voir</span>
                </Link>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title & Slug */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">
                        Titre de l'article *
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        value={data.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Titre accrocheur de votre article"
                        className="mt-1"
                        required
                        disabled={processing}
                      />
                      {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                      <Label htmlFor="slug" className="text-sm font-medium">
                        Slug URL *
                      </Label>
                      <Input
                        id="slug"
                        type="text"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        placeholder="slug-de-votre-article"
                        className="mt-1 font-mono text-sm"
                        required
                        disabled={processing}
                      />
                      {data.slug && (
                        <p className="text-xs text-gray-500 mt-1">URL: /blog/{data.slug}</p>
                      )}
                      {errors.slug && <p className="text-sm text-red-600 mt-1">{errors.slug}</p>}
                    </div>
                  </div>
                </Card>

                {/* Excerpt */}
                <Card className="p-6">
                  <Label htmlFor="excerpt" className="text-sm font-medium">
                    Extrait *
                  </Label>
                  <TinyMCEEditor
                    value={data.excerpt}
                    onEditorChange={(excerpt) => setData('excerpt', excerpt)}
                    placeholder="Résumé court qui apparaîtra sur la page d'accueil du blog..."
                    height={150}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {data.excerpt.length}/160 caractères recommandés
                    </span>
                    {errors.excerpt && <p className="text-sm text-red-600">{errors.excerpt}</p>}
                  </div>
                </Card>

                {/* Content Editor */}
                <Card className="p-6">
                  <Label htmlFor="content" className="text-sm font-medium mb-4 block">
                    Contenu de l'article *
                  </Label>
                  <TinyMCEEditor
                    value={data.content}
                    onEditorChange={(content) => setData('content', content)}
                    placeholder="Écrivez votre article ici..."
                    height={500}
                  />
                  {errors.content && <p className="text-sm text-red-600 mt-2">{errors.content}</p>}
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Publication
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="published"
                        checked={data.published}
                        onChange={(e) => setData('published', e.target.checked)}
                        className="rounded border-gray-300"
                        disabled={processing}
                      />
                      <Label htmlFor="published" className="text-sm">
                        Article publié
                      </Label>
                    </div>

                    {new Date(post.publishedAt) >= new Date() && (
                      <div>
                        <Label htmlFor="publishedAt" className="text-sm font-medium">
                          Date de publication
                        </Label>
                        <Input
                          id="publishedAt"
                          type="datetime-local"
                          value={formatDateTimeLocal(data.publishedAt)}
                          onChange={(e) => setData('publishedAt', e.target.value)}
                          className="mt-1"
                          min={new Date().toISOString().slice(0, 16)}
                          disabled={processing}
                        />
                        {errors.publishedAt && (
                          <p className="text-sm text-red-600">{errors.publishedAt}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Laisser vide pour publier immédiatement
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                      <strong>Statut actuel:</strong> {data.published ? 'Publié' : 'Brouillon'}
                      {data.publishedAt && new Date(data.publishedAt) > new Date() && (
                        <>
                          {' '}
                          - Programmé pour le {new Date(data.publishedAt).toLocaleString('fr-FR')}
                        </>
                      )}
                      {post.notifiedAt && <> - Déjà notifié aux abonnés</>}
                    </div>
                  </div>
                </Card>

                {/* Featured Image */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Image mise en avant
                  </h3>

                  <div className="space-y-4">
                    {displayPreview ? (
                      <div className="relative">
                        <img
                          src={displayPreview}
                          alt="Aperçu"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          disabled={processing}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                          {imageSource === 'file'
                            ? 'Nouveau fichier'
                            : imageSource === 'url'
                              ? 'URL externe'
                              : 'Image actuelle'}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDrag}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onClick={handleContainerClick}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Glissez une image ou cliquez pour sélectionner
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleInputChange}
                          className="hidden"
                          disabled={processing}
                        />
                      </div>
                    )}

                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        type="button"
                        disabled={processing}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {displayPreview ? "Changer l'image" : 'Ajouter une image'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Formats supportés: JPG, PNG, GIF, WebP (max 5MB)
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Ou</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="featuredImageUrl" className="text-sm">
                        URL de l'image
                      </Label>
                      <Input
                        id="featuredImageUrl"
                        type="url"
                        value={data.featuredImageUrl || ''}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                        disabled={processing}
                      />
                    </div>

                    {errors.featuredImage && (
                      <p className="text-sm text-red-600">{errors.featuredImage}</p>
                    )}
                    {errors.featuredImageUrl && (
                      <p className="text-sm text-red-600">{errors.featuredImageUrl}</p>
                    )}
                  </div>
                </Card>

                {/* Tags */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TagIcon className="w-4 h-4" />
                    Tags
                  </h3>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          disabled={processing}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            data.tags.includes(tag.id)
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Actions */}
                <div className="sticky top-6">
                  <div className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={processing || !isDirty}>
                      <Save className="w-4 h-4 mr-2" />
                      {processing ? 'Mise à jour...' : "Mettre à jour l'article"}
                    </Button>

                    <Button
                      variant="outline"
                      type="button"
                      className="w-full"
                      onClick={() => {
                        setData('published', false)
                        handleSubmit(new Event('submit') as any)
                      }}
                      disabled={processing || !isDirty}
                    >
                      Sauvegarder comme brouillon
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

EditBlogPost.layout = (page: React.ReactNode) => (
  <AdminLayout description="Modifier un article de blog existant" currentPath="/admin/blog">
    {page}
  </AdminLayout>
)
