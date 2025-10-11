import type React from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  X,
  DollarSign,
  FileText,
  Settings,
  ImageIcon,
  AlertCircle,
  Info,
  Euro,
} from 'lucide-react'
import { useImageUpload } from '~/utils/hooks/use_image_upload'
import { toast } from 'sonner'
import AdminLayout from '~/layout/AdminLayout'
import TinyMCEEditor from '~/components/TinyMCEEditor'
import { Label } from '@/components/ui/label'

interface Props {
  maxDisplayOrder: number
}

export default function AdminServiceCreate({ maxDisplayOrder }: Props) {
  const { data, setData, post, processing, isDirty, errors } = useForm({
    title: '',
    description: '',
    image: null as File | null,
    price: '',
    isActive: true,
    displayOrder: maxDisplayOrder + 1,
  })

  const {
    preview,
    dragActive,
    uploading,
    fileInputRef,
    handleDrop,
    handleDrag,
    handleInputChange,
    removeImage: removeImagePreview,
    handleContainerClick,
  } = useImageUpload({
    maxSize: 2,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'],
    onImageChange: (file) => setData('image', file),
    onError: (error) => toast.error(error),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    post('/admin/services')
  }

  const removeImage = () => {
    removeImagePreview()
    setData('image', null)
  }

  return (
    <>
      <Head title="Créer un Service" />

      <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Link href={'/admin/services'}>
              <Button
                variant="outline"
                className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>

            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Créer un nouveau service
              </h1>
              <p className="text-gray-600">Ajoutez un service à votre portfolio professionnel</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.visit('/services')}
                className="flex-1 sm:flex-none border-gray-300 hover:border-blue-400 hover:text-blue-600"
              >
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="p-4 sm:p-6 border-0 shadow-lg">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Informations principales
                    </h2>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Titre du service *
                      </label>
                      <Input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Ex: Développement Web, Consultation SEO..."
                        className="h-10 sm:h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                        required
                      />
                      {errors?.title && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description *
                      </Label>
                      <TinyMCEEditor
                        value={data.description}
                        onEditorChange={(content) => setData('description', content)}
                        placeholder="Description détaillée du service..."
                        height={300}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Image Upload */}
                <Card className="p-4 sm:p-6 border-0 shadow-lg">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Image du service</h2>
                  </div>

                  <div className="space-y-4">
                    {preview ? (
                      <div className="relative">
                        <img
                          src={preview || '/placeholder.svg'}
                          alt="Aperçu"
                          className="w-full h-48 sm:h-64 object-cover rounded-xl border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 sm:top-3 right-2 sm:right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer ${
                          dragActive
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDrag}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onClick={handleContainerClick}
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-3 sm:p-4 bg-gray-100 rounded-full">
                            <Upload className="h-6 sm:h-8 w-6 sm:w-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-base sm:text-lg font-medium text-gray-900">
                              Glissez votre image ici
                            </p>
                            <p className="text-sm sm:text-base text-gray-500">
                              ou cliquez pour sélectionner
                            </p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                            onChange={handleInputChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>
                        Formats supportés : JPG, PNG, SVG, WebP. Taille max : 2MB. Recommandé :
                        800x600px minimum.
                      </p>
                    </div>

                    {errors?.image && (
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {errors.image}
                      </p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Pricing */}
                <Card className="p-4 sm:p-6 border-0 shadow-lg">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Tarification</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Prix (optionnel)
                      </label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          value={data.price}
                          onChange={(e) => {
                            setData('price', e.target.value)
                          }}
                          placeholder="0.00"
                          min="100"
                          step="10"
                          className="pl-10 h-10 sm:h-12 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Laissez vide pour "Sur devis"</p>
                      {errors?.price && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.price}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Settings */}
                <Card className="p-4 sm:p-6 border-0 shadow-lg">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Settings className="h-5 w-5 text-orange-600" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Paramètres</h2>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Active Status */}
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={data.isActive}
                          onChange={(e) => setData('isActive', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">Service actif</p>
                          <p className="text-sm text-gray-500">Visible sur votre site public</p>
                        </div>
                      </label>
                    </div>

                    {/* Display Order */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ordre d'affichage
                      </label>
                      <Input
                        type="number"
                        value={data.displayOrder.toString()}
                        onChange={(e) => {
                          const value = e.target.value
                          const numValue = value === '' ? 1 : Number.parseInt(value) || 1
                          setData('displayOrder', numValue)
                        }}
                        min="1"
                        className="h-10 sm:h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Plus le nombre est petit, plus le service apparaîtra en premier
                      </p>
                      {errors?.displayOrder && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.displayOrder}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <Card className="p-4 sm:p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="space-y-3 sm:space-y-4">
                    <Button
                      type="submit"
                      disabled={processing || uploading || !isDirty}
                      className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {processing || uploading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-sm sm:text-base">
                            {uploading ? 'Upload en cours...' : 'Création en cours...'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          <span className="text-sm sm:text-base">Créer le service</span>
                        </div>
                      )}
                    </Button>

                    <Link href={'/admin/services'} className="block">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 sm:h-12 border-gray-300 hover:border-gray-400 text-sm sm:text-base bg-transparent"
                      >
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

AdminServiceCreate.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Créer un Service"
    description="Création d'un nouveau service"
    currentPath="/admin/services/create"
  >
    {page}
  </AdminLayout>
)
