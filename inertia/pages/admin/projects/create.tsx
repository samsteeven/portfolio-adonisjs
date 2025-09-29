import React, { useState } from 'react'
import { useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import { useMultiImageUpload } from '~/utils/hooks/use_multi_image_upload'
import { ArrowLeft, Check, X, Save, AlertCircle, Link2, Github, Calendar, Plus, Eye, EyeOff } from 'lucide-react'
import { Technology } from '~/types/technology'
import { toast } from 'sonner'
import { ProjectCreateProps } from '~/types/projets'

export default function CreateProject({ technologies }: ProjectCreateProps) {
  const { data, setData, post, processing, errors, isDirty, reset } = useForm({
    title: '',
    description: '',
    year: new Date().getFullYear().toString(),
    role: '',
    images: [] as File[],
    demoPath: '',
    githubPath: '',
    isActive: true,
    technologies: [] as number[],
  })

  const [showPreview, setShowPreview] = useState(false)

  // Utilisation du hook useMultiImageUpload
  const {
    images: newImages,
    dragActive,
    fileInputRef,
    handleDrop,
    handleDrag,
    handleInputChange: handleImageInputChange,
    removeImage,
    openFileDialog,
    getFiles,
    getTotalImageCount,
    canAddMore,
  } = useMultiImageUpload({
    maxImages: 4,
    maxSize: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    onError: (error) => {
      toast.error(error)
    },
    existingImages: [],
  })

  // Synchroniser les nouvelles images avec le formulaire
  React.useEffect(() => {
    setData('images', getFiles())
  }, [newImages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/projects', {
      onSuccess: () => {
        reset()
      },
    })
  }

  const toggleTechnology = (techId: number) => {
    const currentTechnologies = data.technologies
    const newTechnologies = currentTechnologies.includes(techId)
      ? currentTechnologies.filter((id: number) => id !== techId)
      : [...currentTechnologies, techId]
    setData('technologies', newTechnologies)
  }

  const selectAllInCategory = (categoryTechs: Technology[]) => {
    const categoryIds = categoryTechs.map((tech) => tech.id)
    const allSelected = categoryIds.every((id) => data.technologies.includes(id))

    if (allSelected) {
      setData(
        'technologies',
        data.technologies.filter((id) => !categoryIds.includes(id))
      )
    } else {
      const newTechnologies = [...new Set([...data.technologies, ...categoryIds])]
      setData('technologies', newTechnologies)
    }
  }

  // Group technologies by category
  const groupedTechnologies = technologies.reduce(
    (acc, tech) => {
      const category = tech.category
      if (!acc[category]) acc[category] = []
      acc[category].push(tech)
      return acc
    },
    {} as Record<string, typeof technologies>
  )

  const selectedCount = data.technologies.length
  const totalCount = technologies.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={'/admin/projects'}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Projets
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nouveau projet</h1>
          <p className="text-gray-600 mt-1">Ajoutez un projet à votre portfolio</p>
          {isDirty && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Vous avez des modifications non sauvegardées</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Informations générales</h2>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Masquer l'aperçu
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Aperçu
                    </>
                  )}
                </button>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
                  Titre du projet *
                </label>
                <input
                  type="text"
                  id="title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base ${
                    errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Ex: Application de gestion de tâches"
                />
                {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Year */}
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-900 mb-2">
                    Année du projet *
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="year"
                      value={data.year}
                      onChange={(e) => setData('year', e.target.value)}
                      className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base ${
                        errors.year ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                      }`}
                      placeholder="2024"
                      maxLength={4}
                    />
                  </div>
                  {errors.year && <p className="mt-2 text-sm text-red-600">{errors.year}</p>}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Visibilité
                  </label>
                  <div className="flex items-center h-full">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={data.isActive}
                          onChange={(e) => setData('isActive', e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-5 sm:h-6 rounded-full transition-colors ${
                            data.isActive ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              data.isActive ? 'translate-x-5' : 'translate-x-0.5'
                            } translate-y-0.5`}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">
                        {data.isActive ? 'Visible' : 'Masqué'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-900 mb-2">
                  Votre rôle (Markdown supporté)
                </label>
                <textarea
                  id="role"
                  rows={3}
                  value={data.role || ''}
                  onChange={(e) => setData('role', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all text-sm sm:text-base ${
                    errors.role ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Ex: **Développeur Full-Stack**&#10;- Conception et développement&#10;- Gestion de projet"
                />
                {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
                <div className="mt-2 text-xs text-gray-500">
                  Vous pouvez utiliser Markdown : **gras**, *italique*, `code`, listes, etc.
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Description (Markdown supporté)
                </label>
                <textarea
                  id="description"
                  rows={6}
                  value={data.description || ''}
                  onChange={(e) => setData('description', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all text-sm sm:text-base ${
                    errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Décrivez votre projet en utilisant **Markdown** pour le formatage..."
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Vous pouvez utiliser Markdown : **gras**, *italique*, `code`, etc.
                </div>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Aperçu</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{data.title || 'Titre du projet'}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                          {data.year}
                        </span>
                        <span className="text-xs text-gray-500">{data.role || 'Votre rôle'}</span>
                      </div>
                    </div>
                    
                    {data.description && (
                      <div className="prose prose-sm max-w-none">
                        <div 
                          className="text-gray-700"
                          dangerouslySetInnerHTML={{ 
                            __html: data.description.replace(/\n/g, '<br />') 
                          }} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Links section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Liens du projet</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="demoPath"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      URL de démonstration
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        id="demoPath"
                        value={data.demoPath || ''}
                        onChange={(e) => setData('demoPath', e.target.value)}
                        className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base ${
                          errors.demoPath ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                        }`}
                        placeholder="https://demo.exemple.com"
                      />
                    </div>
                    {errors.demoPath && (
                      <p className="mt-2 text-sm text-red-600">{errors.demoPath}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="githubPath"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Repository GitHub
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Github className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        id="githubPath"
                        value={data.githubPath || ''}
                        onChange={(e) => setData('githubPath', e.target.value)}
                        className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base ${
                          errors.githubPath
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-200'
                        }`}
                        placeholder="https://github.com/utilisateur/projet"
                      />
                    </div>
                    {errors.githubPath && (
                      <p className="mt-2 text-sm text-red-600">{errors.githubPath}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Technologies utilisées</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {selectedCount}/{totalCount} sélectionnées
                  </span>
                  {selectedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setData('technologies', [])}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Tout désélectionner
                    </button>
                  )}
                </div>
              </div>

              {Object.keys(groupedTechnologies).length > 1 ? (
                <div className="space-y-5">
                  {Object.entries(groupedTechnologies).map(([category, techs]) => {
                    const categorySelected = techs.filter((tech) =>
                      data.technologies.includes(tech.id)
                    ).length
                    const allCategorySelected = techs.every((tech) =>
                      data.technologies.includes(tech.id)
                    )

                    return (
                      <div key={category} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                              {category}
                            </p>
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                              {categorySelected}/{techs.length}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => selectAllInCategory(techs)}
                            className={`text-xs font-medium px-3 py-1 rounded-full transition-colors whitespace-nowrap ${
                              allCategorySelected
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {allCategorySelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {techs.map((tech) => (
                            <button
                              key={tech.id}
                              type="button"
                              onClick={() => toggleTechnology(tech.id)}
                              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all hover:scale-105 ${
                                data.technologies.includes(tech.id)
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                              }`}
                            >
                              {data.technologies.includes(tech.id) && (
                                <Check className="w-3 h-3 inline mr-1" />
                              )}
                              {tech.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => toggleTechnology(tech.id)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all hover:scale-105 ${
                        data.technologies.includes(tech.id)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {data.technologies.includes(tech.id) && (
                        <Check className="w-3 h-3 inline mr-1" />
                      )}
                      {tech.name}
                    </button>
                  ))}
                </div>
              )}

              {errors.technologies && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.technologies}</span>
                </div>
              )}
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Images Upload */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Images du projet</h3>
                <span className="text-sm text-gray-500">{getTotalImageCount()}/4</span>
              </div>

              {/* Images ajoutées */}
              {newImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Images ajoutées</p>
                  <div className="grid grid-cols-2 gap-3">
                    {newImages.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt={`Image ${index + 1}`}
                          className="w-full h-20 sm:h-24 object-cover rounded-lg border-2 border-blue-200"
                        />
                        <div className="absolute inset-0 group-hover:bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="opacity-0 group-hover:opacity-100 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                          >
                            <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                        </div>
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 sm:px-2 py-0.5 rounded">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Zone d'upload */}
              {canAddMore() && (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={openFileDialog}
                >
                  <div className="flex flex-col items-center">
                    <Plus className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700 mb-1">Ajouter des images</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP jusqu'à 5MB</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {4 - getTotalImageCount()} emplacements restants
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageInputChange}
                    className="hidden"
                  />
                </div>
              )}

              {errors.images && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.images}</span>
                </div>
              )}

              {getTotalImageCount() === 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Ajoutez au moins une image pour mieux présenter votre projet.
                  </p>
                </div>
              )}
            </div>

            {/* Résumé */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Titre :</span>
                  <span className="font-medium truncate max-w-[50%]">{data.title || 'Non défini'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Année :</span>
                  <span className="font-medium">{data.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Images :</span>
                  <span className="font-medium">{newImages.length} ajoutées</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Technologies :</span>
                  <span className="font-medium">{selectedCount} sélectionnées</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut :</span>
                  <span
                    className={`font-medium ${data.isActive ? 'text-green-600' : 'text-gray-600'}`}
                  >
                    {data.isActive ? 'Visible' : 'Masqué'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Modifications :</span>
                  <span className={`font-medium ${isDirty ? 'text-amber-600' : 'text-gray-600'}`}>
                    {isDirty ? 'Non sauvegardées' : 'Aucune'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={processing || !isDirty || !data.title.trim()}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium text-white transition-all text-sm sm:text-base ${
                    processing || !data.title.trim() || !isDirty
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 hover:cursor-pointer focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Création en cours...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Créer le projet</span>
                    </>
                  )}
                </button>

                <Link
                  href={'/admin/projects'}
                  className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Annuler
                </Link>
              </div>
            </div>
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