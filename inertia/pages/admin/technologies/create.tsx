import React from 'react'
import { Link, useForm } from '@inertiajs/react'
import {
  ArrowLeft,
  Upload,
  X,
  Code2,
  Tag,
  FileText,
  ExternalLink,
  Save,
  Loader2,
  RotateCcw,
  Eye,
} from 'lucide-react'
import AdminLayout from '~/layout/AdminLayout'
import TinyMCEEditor from '~/components/TinyMCEEditor'
import { useImageUpload } from '~/utils/hooks/use_image_upload'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import SafeHTML from '~/components/safeHTML'

export default function TechnologiesCreate({ categories }: { categories: string[] }) {
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
    maxSize: 2,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'],
    onImageChange: (file) => setData('imgPath', file),
    onError: (error) => toast.error(error),
  })
  const { data, setData, post, processing, errors, reset, isDirty } = useForm<{
    name: string
    category: string
    imgPath: File | null
    lienOrigin: string
    description: string
  }>({
    name: '',
    category: '',
    imgPath: null,
    lienOrigin: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    post('/admin/technologies', {
      onSuccess: () => handleReset(),
    })
  }
  // Fonction pour supprimer l'image (preview + formulaire)
  const removeImage = () => {
    removeImagePreview() // Supprime le preview visuel
    setData('imgPath', null) // Supprime du formulaire
  }

  const handleReset = () => {
    reset()
    removeImage()
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={'/admin/technologies'}
              className="inline-flex items-center text-base text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour aux technologies
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ajouter une technologie</h1>
              <p className="mt-2 text-gray-600">
                Ajoutez une nouvelle technologie à votre portfolio
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={!isDirty || processing}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </Button>
              <Button
                type="submit"
                form="technology-form"
                disabled={processing}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Créer la technologie
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <form id="technology-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Informations principales */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Code2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Informations principales
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Nom de la technologie */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Code2 className="w-4 h-4" />
                        Nom de la technologie *
                      </label>
                      <Input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ex: React, Vue.js, Laravel..."
                        required
                        className="h-11"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* Catégorie */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Tag className="w-4 h-4" />
                        Catégorie *
                      </label>
                      <div className="space-y-3">
                        {categories.length > 0 && (
                          <select
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Sélectionner une catégorie</option>
                            {categories.map((category, index) => (
                              <option key={index} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        )}
                        <Input
                          type="text"
                          value={data.category}
                          onChange={(e) => setData('category', e.target.value)}
                          placeholder="Ou créer une nouvelle catégorie"
                          className="h-11"
                        />
                      </div>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                      )}
                    </div>

                    {/* Lien d'origine */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <ExternalLink className="w-4 h-4" />
                        Lien d'origine (optionnel)
                      </label>
                      <Input
                        type="url"
                        value={data.lienOrigin}
                        onChange={(e) => setData('lienOrigin', e.target.value)}
                        placeholder="https://..."
                        className="h-11"
                      />
                      {errors.lienOrigin && (
                        <p className="mt-1 text-sm text-red-600">{errors.lienOrigin}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4" />
                        Description (optionnel)
                      </label>
                      <TinyMCEEditor
                        value={data.description}
                        onEditorChange={(content) => setData('description', content)}
                        placeholder="Décrivez cette technologie, son usage, ses avantages..."
                        height={250}
                      />
                      <div className="flex justify-between mt-1">
                        {errors.description ? (
                          <p className="text-sm text-red-600">{errors.description}</p>
                        ) : (
                          <div />
                        )}
                        <p className="text-xs sm:text-sm text-gray-500">
                          {data.description.length}/1000
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Image Upload */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Upload className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Image de la technologie</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Zone d'upload */}
                    <div
                      className={`relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer ${
                        dragActive
                          ? 'border-blue-500 bg-blue-50'
                          : errors.imgPath
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDrag}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onClick={handleContainerClick}
                    >
                      {imagePreview ? (
                        /* Aperçu de l'image */
                        <div className="relative group">
                          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                            <img
                              src={imagePreview}
                              alt="Aperçu"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage()
                            }}
                            className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        /* Zone de drop */
                        <div className="aspect-square flex flex-col items-center justify-center p-6">
                          <div className="p-3 bg-gray-100 rounded-full mb-4">
                            <Upload className="w-6 h-6 text-gray-500" />
                          </div>
                          <p className="font-medium text-gray-700 text-center mb-1">
                            Glissez une image ou cliquez pour sélectionner
                          </p>
                          <p className="text-sm text-gray-500 text-center">
                            Formats supportés: JPG, PNG, SVG ou WebP jusqu'à 2MB
                          </p>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                        onChange={handleInputChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>

                    {errors.imgPath && <p className="text-sm text-red-600">{errors.imgPath}</p>}

                    {/* Conseils pour l'image */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">
                        Conseils pour une meilleure image :
                      </h4>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Utilisez le logo officiel de la technologie</li>
                        <li>• Préférez un fond transparent (PNG/SVG)</li>
                        <li>• Format carré recommandé (1:1)</li>
                        <li>• Résolution minimum 200x200px</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Aperçu de la carte */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Eye className="h-5 w-5 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Aperçu</h2>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      {/* Image preview */}
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Aperçu"
                            className="w-16 h-16 object-contain"
                          />
                        ) : (
                          <Code2 className="w-12 h-12 text-gray-400" />
                        )}
                        {data.category && (
                          <div className="absolute top-3 right-3 bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium max-w-[calc(100%-16px)] truncate">
                            {data.category}
                          </div>
                        )}
                      </div>

                      {/* Content preview */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 truncate">
                          {data.name || 'Nom de la technologie'}
                        </h3>
                        {data.description && (
                          <div className="text-gray-600 text-sm">
                            <SafeHTML html={data.description} className="line-clamp-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

TechnologiesCreate.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Ajouter une tech"
    description="Ajouter une tech"
    currentPath="/admin/technologies"
  >
    {page}
  </AdminLayout>
)
