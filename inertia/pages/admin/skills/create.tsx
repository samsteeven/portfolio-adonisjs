import { useForm, Link } from '@inertiajs/react'
import React, { FormEventHandler } from 'react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Image, Info } from 'lucide-react'
import TinyMCEEditor from '~/components/TinyMCEEditor'
import { useImageUpload } from '~/utils/hooks/use_image_upload'
import { toast } from 'sonner'
import SafeHTML from '~/components/safeHTML'

export default function CreateSkill({ categories }: { categories: string[] }) {
  const {
    preview: imagePreview,
    dragActive,
    fileInputRef,
    handleDrop,
    handleDrag,
    handleInputChange,
    removeImage,
    handleContainerClick,
  } = useImageUpload({
    maxSize: 2,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    onError: (error) => toast.error(error),
  })

  const { data, setData, post, processing, errors, reset, isDirty } = useForm({
    name: '',
    category: '',
    description: '',
    imagePath: null as File | null,
    isActive: true as boolean,
  })

  const handleReset = () => {
    reset()
    removeImage()
  }

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault()

    // Set the image file in the form data
    if (fileInputRef.current?.files?.[0]) {
      setData('imagePath', fileInputRef.current.files[0])
    }

    post('/admin/skills', {
      onSuccess: () => handleReset(),
    })
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          {/* Header avec breadcrumb amélioré */}
          <div className="mb-6">
            <Link
              href={'/admin/skills'}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-3"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour aux compétences
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Nouvelle compétence
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Ajoutez une compétence à votre portfolio
                </p>
              </div>

              {/* Actions rapides en haut sur mobile */}
              <div className="flex gap-2 sm:hidden">
                <Button
                  type="submit"
                  form="skill-form"
                  disabled={processing || !isDirty}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {processing ? 'Création...' : 'Créer'}
                </Button>
                <Link href={'/admin/skills'} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Annuler
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <form id="skill-form" onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contenu principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Informations générales */}
                <Card className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-lg font-semibold text-gray-900">Informations générales</h2>
                  </div>

                  <div className="space-y-5">
                    {/* Nom */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                      >
                        Nom de la compétence <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ex: React.js, Python, UI/UX Design..."
                        className={errors.name ? 'border-red-300 focus:ring-red-500' : ''}
                        required
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                          <Info className="h-3.5 w-3.5" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Catégorie */}
                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                      >
                        Catégorie <span className="text-red-500">*</span>
                      </label>

                      {categories.length > 0 && (
                        <div className="mb-3">
                          <select
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                              errors.category
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            <option value="">Sélectionner une catégorie existante</option>
                            {categories.map((category, index) => (
                              <option key={index} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1.5 text-xs text-gray-500">
                            ou créez-en une nouvelle ci-dessous
                          </p>
                        </div>
                      )}

                      <Input
                        id="category"
                        type="text"
                        value={data.category}
                        onChange={(e) => setData('category', e.target.value)}
                        placeholder="Ex: Frontend, Backend, Design, DevOps..."
                        className={errors.category ? 'border-red-300 focus:ring-red-500' : ''}
                        required
                      />
                      {errors.category && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                          <Info className="h-3.5 w-3.5" />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                      >
                        Description <span className="text-gray-400 text-xs">(optionnel)</span>
                      </label>
                      <TinyMCEEditor
                        value={data.description}
                        onEditorChange={(content) => setData('description', content)}
                        placeholder="Décrivez votre expertise, vos projets réalisés avec cette compétence..."
                        height={200}
                      />
                      {errors.description && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                          <Info className="h-3.5 w-3.5" />
                          {errors.description}
                        </p>
                      )}
                      <p className="mt-1.5 text-xs text-gray-500">
                        Ajoutez des détails sur votre niveau et votre expérience
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Image */}
                <Card className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-lg font-semibold text-gray-900">Image de la compétence</h2>
                  </div>

                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative group">
                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          className="w-full h-56 sm:h-64 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-3 right-3 bg-red-500 text-white rounded-lg p-2 hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                          aria-label="Supprimer l'image"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-sm">
                          Image sélectionnée
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 sm:p-12 transition-all cursor-pointer ${
                          dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDrag}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onClick={handleContainerClick}
                      >
                        <div className="text-center">
                          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Image className="h-8 w-8 text-gray-400" />
                          </div>
                          <label htmlFor="image" className="cursor-pointer">
                            <span className="block text-sm font-medium text-gray-900 mb-1">
                              Cliquez ou glissez une image
                            </span>
                            <input
                              ref={fileInputRef}
                              id="image"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleInputChange}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF, WEBP - Maximum 2MB
                          </p>
                        </div>
                      </div>
                    )}

                    {errors.imagePath && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <Info className="h-3.5 w-3.5" />
                        {errors.imagePath}
                      </p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Aperçu */}
                <Card className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-gray-900">Aperçu en direct</h3>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    {imagePreview && (
                      <div className="mb-3">
                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          className="w-full h-28 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <h4 className="font-semibold text-gray-900 text-base">
                      {data.name || 'Nom de la compétence'}
                    </h4>

                    {data.category && (
                      <p className="text-sm text-blue-600 font-medium mt-1">{data.category}</p>
                    )}

                    {data.description && (
                      <div className="text-gray-600 text-xs ">
                        <SafeHTML html={data.description} className="line-clamp-2" />
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          data.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            data.isActive ? 'bg-green-600' : 'bg-gray-600'
                          }`}
                        ></span>
                        {data.isActive ? 'Visible' : 'Masqué'}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Paramètres */}
                <Card className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                    <h2 className="text-base font-semibold text-gray-900">Visibilité</h2>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={data.isActive}
                      onChange={(e) => setData('isActive', e.target.checked)}
                      className="mt-0.5 w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="isActive"
                        className="text-sm font-medium text-gray-900 cursor-pointer block"
                      >
                        Compétence active
                      </label>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Visible publiquement sur votre portfolio
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Actions - Caché sur mobile */}
                <Card className="p-4 sm:p-6 hidden sm:block">
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      disabled={processing || !isDirty}
                      className="w-full bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Création...
                        </span>
                      ) : (
                        'Créer la compétence'
                      )}
                    </Button>

                    {isDirty && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="w-full text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Réinitialiser
                      </Button>
                    )}

                    <Link href={'/admin/skills'}>
                      <Button type="button" variant="outline" className="w-full hover:bg-gray-50">
                        Annuler
                      </Button>
                    </Link>
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

CreateSkill.layout = (page: React.ReactNode) => (
  <AdminLayout title="Nouveau skill" description="Ajouter un skill" currentPath="/admin/skills">
    {page}
  </AdminLayout>
)
