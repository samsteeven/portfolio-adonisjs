import React, { useRef, useState } from 'react'
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
  FileText,
  Image as ImageIcon,
  Tag as TagIcon,
} from 'lucide-react'
import { formatDateTimeLocal, generateSlug } from '~/utils/utils_string'

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
    featuredImage: null as File | null, // Fichier uploadé
    featuredImageUrl: post.photoPathPublicUrl === post.featuredImage ? post.featuredImage : null, // URL externe ou existante
    published: post.published,
    publishedAt: post.publishedAt || '',
    tags: post.tags.map((tag) => tag.id),
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState(post.photoPathPublicUrl || '')
  const [imageSource, setImageSource] = useState<'file' | 'url'>('url') // Track source type

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setImageSource('file')
        setData({
          ...data,
          featuredImage: file, // Fichier pour upload
          featuredImageUrl: '', // Vider l'URL quand on upload un fichier
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlChange = (url: string) => {
    setImagePreview(url)
    setImageSource('url')
    setData({
      ...data,
      featuredImage: null, // Pas de fichier quand on utilise une URL
      featuredImageUrl: url,
    })
  }

  const clearImage = () => {
    setImagePreview('')
    setImageSource('url')
    setData({
      ...data,
      featuredImage: null,
      featuredImageUrl: '',
    })
  }

  const toggleTag = (tagId: number) => {
    const currentTags = data.tags
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId]

    setData('tags', newTags)
  }
  const handleTitleChange = (title: string) => {
    setData((prevData) => ({
      ...prevData,
      title,
      slug: generateSlug(title),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Ajouter le bon champ selon le type d'image
    if (imageSource === 'file' && data.featuredImage) {
      setData((previousData) => ({ ...previousData, featuredImage: data.featuredImage }))
    } else if (imageSource === 'url' && data.featuredImageUrl) {
      setData((previousData) => ({ ...previousData, featuredImageUrl: data.featuredImageUrl }))
    }

    transform((formData) => ({
      ...formData,
      publishedAt: formData.publishedAt
        ? new Date(formData.publishedAt).toISOString().slice(0, 19).replace('T', ' ')
        : null,
    }))

    patch(`/admin/blog/${post.id}`)
  }

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
                  <textarea
                    id="excerpt"
                    value={data.excerpt}
                    onChange={(e) => setData('excerpt', e.target.value)}
                    placeholder="Résumé court qui apparaîtra sur la page d'accueil du blog..."
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                    disabled={processing}
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
                  <div className="border border-gray-300 rounded-lg">
                    <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        Éditeur Markdown supporté
                      </div>
                    </div>
                    <textarea
                      id="content"
                      value={data.content}
                      onChange={(e) => setData('content', e.target.value)}
                      placeholder="Écrivez votre article ici... Vous pouvez utiliser la syntaxe Markdown."
                      rows={20}
                      className="w-full p-4 border-none focus:ring-0 resize-none font-mono text-sm"
                      required
                      disabled={processing}
                    />
                  </div>
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

                    {!post.published &&
                      post.publishedAt &&
                      new Date(post.publishedAt) > new Date() && (
                        <div>
                          <Label htmlFor="publishedAt" className="text-sm font-medium">
                            Date de publication
                          </Label>
                          <Input
                            id="publishedAt"
                            type="datetime-local"
                            value={formatDateTimeLocal(post.publishedAt)}
                            onChange={(e) => setData('publishedAt', e.target.value)}
                            className="mt-1"
                            min={new Date().toISOString().slice(0, 16)}
                            disabled={processing}
                          />
                          {errors.publishedAt && (
                            <p className="text-sm text-red-600">{errors.publishedAt}</p>
                          )}
                        </div>
                      )}

                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                      <strong>Statut actuel:</strong> {post.published ? 'Publié' : 'Brouillon'}
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
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          disabled={processing}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                          {imageSource === 'file' ? 'Fichier uploadé' : 'URL externe'}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Aucune image sélectionnée</p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          type="button"
                          disabled={processing}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {imagePreview ? "Changer l'image" : 'Ajouter une image'}
                        </Button>
                      </Label>
                      <input
                        ref={fileInputRef}
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="featuredImageUrl" className="text-sm">
                        Ou URL de l'image
                      </Label>
                      <Input
                        id="featuredImageUrl"
                        type="url"
                        value={data.featuredImageUrl || ''}
                        onChange={(e) => handleUrlChange(e.target.value)}
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
