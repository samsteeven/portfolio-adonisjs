import React from 'react'
import { useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import { Code, ArrowLeft} from 'lucide-react'

interface CreateTechnologyProps {
  categories: Array<{
    id: number
    name: string
  }>
}

export default function CreateTechnology({ categories }: CreateTechnologyProps) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    category: '',
    imgPath: '',
    lienOrigin: '',
    isActive: true as boolean
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/technologies')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/technologies"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux technologies
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Code className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Nouvelle technologie</h1>
            <p className="text-gray-600">Ajoutez une nouvelle technologie à votre portfolio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la technologie
              </label>
              <input
                type="text"
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: React, Node.js, Docker"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="category"
                value={data.category}
                onChange={(e) => setData('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={data.description || ''}
              onChange={(e) => setData('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Description de la technologie"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Liens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="imgPath" className="block text-sm font-medium text-gray-700 mb-2">
                Chemin de l'image
              </label>
              <input
                type="text"
                id="imgPath"
                value={data.imgPath || ''}
                onChange={(e) => setData('imgPath', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.imgPath ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Chemin vers l'image de la technologie"
              />
              {errors.imgPath && (
                <p className="mt-1 text-sm text-red-600">{errors.imgPath}</p>
              )}
            </div>

            <div>
              <label htmlFor="lienOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                Lien d'origine
              </label>
              <input
                type="text"
                id="lienOrigin"
                value={data.lienOrigin || ''}
                onChange={(e) => setData('lienOrigin', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.lienOrigin ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="URL d'origine de la technologie"
              />
              {errors.lienOrigin && (
                <p className="mt-1 text-sm text-red-600">{errors.lienOrigin}</p>
              )}
            </div>
          </div>

          {/* Statut actif */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.isActive}
                onChange={(e) => setData('isActive', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Technologie active</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Link
              href="/admin/technologies"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? 'Création...' : 'Créer la technologie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

CreateTechnology.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Nouvelle technologie"
    description="Ajouter une nouvelle technologie"
    currentPath="/admin/technologies"
  >
    {page}
  </AdminLayout>
)
