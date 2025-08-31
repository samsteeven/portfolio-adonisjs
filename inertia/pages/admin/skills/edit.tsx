import { useForm, Link } from '@inertiajs/react'
import React, { FormEventHandler, useState } from 'react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Image } from 'lucide-react'
import { SkillType } from '~/types/skills'

interface Props {
  skill: SkillType
  categories: string[]
}

export default function EditSkill({ skill, categories }: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(skill.imagePathPublicUrl)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const { data, setData, patch, processing, errors, reset, isDirty } = useForm({
    name: skill.name,
    category: skill.category,
    description: skill.description || '',
    imagePath: null as File | null,
    isActive: skill.isActive,
  })

  const handleReset = () => {
    reset()
    setImagePreview(skill.imagePathPublicUrl)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setData('imagePath', file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setData('imagePath', null)
    setImagePreview(null)
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault()
    patch(`/admin/skills/${skill.id}`, {
      preserveScroll: true,
    })
  }

  return (
    <>
      <div className="min-h-screen sm:bg-gray-50 sm:p-3">
        <div className="px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href={'/admin/skills'}
                className="inline-flex items-center text-base text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour aux compétences
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Modifier la compétence</h1>
            <p className="mt-2 text-sm text-gray-600">
              Modifiez les informations de la compétence "{skill.name}"
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6 bg-white sm:p-2 sm:rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Informations générales
                  </h2>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nom de la compétence *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ex: React.js, Python, UI/UX Design..."
                        required
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* Category */}
                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Catégorie *
                      </label>
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
                      <Input
                        id="category"
                        type="text"
                        className="mt-2"
                        value={data.category}
                        onChange={(e) => setData('category', e.target.value)}
                        placeholder="ou modifier. Ex: Frontend, Backend, Design, DevOps..."
                        required
                      />
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Description
                      </label>
                      <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Décrire la compétence, votre niveau d'expertise, les projets réalisés..."
                        rows={4}
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Image Upload */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Image de la compétence
                  </h2>

                  <div className="space-y-4">
                    {/* Current Image or Preview */}
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg
                            className="w-4 h-4"
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
                        {data.imagePath && (
                          <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                            Nouvelle image sélectionnée
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                          <Image className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <label htmlFor="image" className="cursor-pointer">
                              <span className="mt-2 block text-sm font-medium text-gray-900">
                                Cliquez pour ajouter une image
                              </span>
                              <input
                                ref={fileInputRef}
                                id="image"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                            <p className="mt-1 text-sm text-gray-500">PNG, JPG, GIF jusqu'à 2MB</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Change Image Button */}
                    {imagePreview && (
                      <div className="text-center">
                        <label htmlFor="image-change" className="cursor-pointer">
                          <Button type="button" variant="outline" className="mt-2">
                            Changer l'image
                          </Button>
                          <input
                            ref={fileInputRef}
                            id="image-change"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    )}

                    {errors.imagePath && <p className="text-sm text-red-600">{errors.imagePath}</p>}
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Paramètres</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                          Compétence active
                        </label>
                        <p className="text-sm text-gray-500">
                          La compétence sera visible publiquement
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={data.isActive}
                        onChange={(e) => setData('isActive', e.target.checked)}
                        className={`w-6 h-6 text-blue-600 focus:outline-none border-gray-300 rounded focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                </Card>

                {/* Actions */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <Button
                      type="submit"
                      disabled={processing || !isDirty}
                      className="w-full bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Mise à jour...' : 'Mettre à jour'}
                    </Button>
                    {isDirty && (
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        className="w-full text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Réinitialiser
                      </Button>
                    )}
                    <Link href={'/admin/skills'}>
                      <Button variant="outline" className="w-full">
                        Annuler
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* Info Card */}
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Informations</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Créé le :</span>
                      <br />
                      {new Date(skill.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {skill.updatedAt && (
                      <div>
                        <span className="font-medium">Modifié le :</span>
                        <br />
                        {new Date(skill.updatedAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Preview Card */}
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Aperçu</h3>
                  <div className="rounded-lg p-3 bg-gray-50">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <h4 className="font-medium text-gray-900">
                      {data.name || 'Nom de la compétence'}
                    </h4>
                    {data.category && (
                      <p className="text-sm text-blue-600 font-medium">{data.category}</p>
                    )}
                    {data.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{data.description}</p>
                    )}
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          data.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {data.isActive ? 'Actif' : 'Inactif'}
                      </span>
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

EditSkill.layout = (page: React.ReactNode) => (
  <AdminLayout title="Modifier skill" description="Modifier un skill" currentPath="/admin/skills">
    {page}
  </AdminLayout>
)
