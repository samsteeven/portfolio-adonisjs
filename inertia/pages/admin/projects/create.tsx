import React from 'react'
import { useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import {
  Briefcase,
  ArrowLeft,
} from 'lucide-react'

interface CreateProjectProps {
  categories: Array<{
    id: number
    name: string
  }>
  technologies: Array<{
    id: number
    name: string
    color: string
  }>
}

export default function CreateProject({ technologies }: CreateProjectProps) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    imgPath: '',
    demoPath: '',
    githubPath: '',
    isActive: true as boolean,
    technologies: [] as number[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/projects')
  }

  const toggleTechnology = (techId: number) => {
    const currentTechnologies = data.technologies
    const newTechnologies = currentTechnologies.includes(techId)
      ? currentTechnologies.filter((id: number) => id !== techId)
      : [...currentTechnologies, techId]
    setData('technologies', newTechnologies)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux projets
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Nouveau projet</h1>
            <p className="text-gray-600">Créez un nouveau projet pour votre portfolio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre du projet
              </label>
              <input
                type="text"
                id="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nom du projet"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="imgPath" className="block text-sm font-medium text-gray-700 mb-2">
                Chemin de l'image
              </label>
              <input
                type="text"
                id="imgPath"
                value={data.imgPath}
                onChange={(e) => setData('imgPath', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.imgPath ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Chemin vers l'image du projet"
              />
              {errors.imgPath && <p className="mt-1 text-sm text-red-600">{errors.imgPath}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={data.description || ''}
              onChange={(e) => setData('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Description détaillée du projet"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Liens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="demoPath" className="block text-sm font-medium text-gray-700 mb-2">
                Chemin de la démo
              </label>
              <input
                type="text"
                id="demoPath"
                value={data.demoPath || ''}
                onChange={(e) => setData('demoPath', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.demoPath ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="URL de la démo"
              />
              {errors.demoPath && <p className="mt-1 text-sm text-red-600">{errors.demoPath}</p>}
            </div>

            <div>
              <label htmlFor="githubPath" className="block text-sm font-medium text-gray-700 mb-2">
                Chemin GitHub
              </label>
              <input
                type="text"
                id="githubPath"
                value={data.githubPath || ''}
                onChange={(e) => setData('githubPath', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.githubPath ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="URL du repository GitHub"
              />
              {errors.githubPath && <p className="mt-1 text-sm text-red-600">{errors.githubPath}</p>}
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
              <span className="text-sm font-medium text-gray-700">Projet actif</span>
            </label>
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Technologies utilisées
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {technologies.map((tech) => (
                <label key={tech.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.technologies.includes(tech.id)}
                    onChange={() => toggleTechnology(tech.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{tech.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Link
              href="/admin/projects"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? 'Création...' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

CreateProject.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Nouveau projet"
    description="Créer un nouveau projet pour le portfolio"
    currentPath="/admin/projects"
  >
    {page}
  </AdminLayout>
)
