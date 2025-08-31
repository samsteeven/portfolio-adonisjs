import React, { useState, useRef } from 'react'
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
} from 'lucide-react'
import AdminLayout from '~/layout/AdminLayout'

export default function TechnologiesCreate({ categories }: { categories: string[] }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setData('imgPath', file)

    // Créer un aperçu de l'image
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setData('imgPath', null)
    setImagePreview(null)
    // Reset l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    post('/admin/technologies', {
      onSuccess: () => handleReset(),
    })
  }

  const handleReset = () => {
    reset()
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:h-16 gap-4 sm:gap-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <Link
                  href={'/admin/technologies'}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Ajouter une technologie
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Ajoutez une nouvelle technologie à votre portfolio
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* Colonne gauche - Informations principales */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* Nom de la technologie */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Code2 className="w-4 h-4" />
                        Nom de la technologie *
                      </label>
                      <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ex: React, Vue.js, Laravel..."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base ${
                          errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* Catégorie */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Tag className="w-4 h-4" />
                        Catégorie *
                      </label>
                      <div className="flex-col">
                        {categories.length > 0 && (
                          <select
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            className={`w-full mb-3 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-none transition-colors ${
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
                        <input
                          type="text"
                          value={data.category}
                          onChange={(e) => setData('category', e.target.value)}
                          placeholder="Ou créer une nouvelle catégorie"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base ${
                            errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
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
                      <input
                        type="url"
                        value={data.lienOrigin}
                        onChange={(e) => setData('lienOrigin', e.target.value)}
                        placeholder="https://..."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base ${
                          errors.lienOrigin ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
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
                      <textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={4}
                        placeholder="Décrivez cette technologie, son usage, ses avantages..."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-sm sm:text-base ${
                          errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
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

                  {/* Colonne droite - Image */}
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Upload className="w-4 h-4" />
                        Image de la technologie
                      </label>

                      {/* Zone d'upload */}
                      <div
                        className={`relative border-2 border-dashed rounded-lg transition-colors ${
                          errors.imgPath
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {imagePreview ? (
                          /* Aperçu de l'image */
                          <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
                            <img
                              src={imagePreview}
                              alt="Aperçu"
                              className="w-full h-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        ) : (
                          /* Zone de drop */
                          <div className="aspect-square flex flex-col items-center justify-center p-4 sm:p-6">
                            <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" />
                            <p className="text-gray-600 text-center mb-2 text-sm sm:text-base">
                              Cliquez pour sélectionner une image
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 text-center">
                              JPG, PNG, SVG ou WebP • Max 2MB
                            </p>
                          </div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>

                      {errors.imgPath && (
                        <p className="mt-1 text-sm text-red-600">{errors.imgPath}</p>
                      )}

                      {/* Conseils pour l'image */}
                      <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                          Conseils pour une meilleure image :
                        </h4>
                        <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                          <li>• Utilisez le logo officiel de la technologie</li>
                          <li>• Préférez un fond transparent (PNG/SVG)</li>
                          <li>• Format carré recommandé (1:1)</li>
                          <li>• Résolution minimum 200x200px</li>
                        </ul>
                      </div>
                    </div>

                    {/* Aperçu de la carte */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Aperçu de la carte :
                      </h4>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Image preview */}
                        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Aperçu"
                              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                            />
                          ) : (
                            <Code2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                          )}
                          {data.category && (
                            <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium max-w-[calc(100%-16px)] truncate">
                              {data.category}
                            </div>
                          )}
                        </div>

                        {/* Content preview */}
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">
                            {data.name || 'Nom de la technologie'}
                          </h3>
                          {data.description && (
                            <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
                              {data.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-gray-200 mt-6 sm:mt-8 gap-3 sm:gap-0">
                  <Link
                    href={'/admin/technologies'}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-center sm:text-left"
                  >
                    Annuler
                  </Link>

                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Réinitialiser
                    </button>
                    <button
                      type="submit"
                      disabled={processing || !isDirty}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {processing ? 'Création...' : 'Créer la technologie'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
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
