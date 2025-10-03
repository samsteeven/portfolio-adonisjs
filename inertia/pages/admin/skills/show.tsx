import { Head, Link, router } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Image,
  Tag,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Share2,
  Download,
} from 'lucide-react'
import { SkillType } from '~/types/skills'
import { toast } from 'sonner'
import SafeHTML from '~/components/safeHTML'

interface Props {
  skill: SkillType
}

export default function ShowSkill({ skill }: Props) {
  const [isClient, setIsClient] = useState(false)

  // État pour le modal de suppression
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  })

  // Résoudre l'hydratation en s'assurant que le rendu côté client soit identique
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fonction pour formater les dates de manière consistante
  const formatDate = (dateString: string, option?: Intl.DateTimeFormatOptions) => {
    if (!isClient) {
      // Côté serveur, on retourne une chaîne vide ou une valeur par défaut
      return '...'
    }
    return new Date(dateString).toLocaleDateString('fr-FR', option)
  }

  const handleDeleteClick = () => {
    setDeleteModal({
      isOpen: true,
      isLoading: false,
    })
  }

  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, isLoading: true }))

    try {
      router.delete(`/admin/skills/${skill.id}`, {
        onSuccess: () => {
          setDeleteModal({
            isOpen: false,
            isLoading: false,
          })
        },
        onError: () => {
          setDeleteModal((prev) => ({ ...prev, isLoading: false }))
        },
      })
    } catch (error) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      isLoading: false,
    })
  }

  const toggleStatus = () => {
    router.patch(`/admin/skills/${skill.id}/toggle-status`)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papier')
  }

  return (
    <>
      <Head title={skill.name} />
      <div className="min-h-screen sm:bg-gray-50 sm:p-3">
        <div className="px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href={'/admin/skills'}
                className="inline-flex items-center text-base text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour aux skills
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{skill.name}</h1>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      skill.isActive
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {skill.isActive ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Actif
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Inactif
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Tag className="h-4 w-4" />
                  <span className="font-medium">{skill.category}</span>
                </div>

                <p className="text-gray-600">
                  Compétence créée le{' '}
                  {formatDate(skill.createdAt.toString(), {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {skill.updatedAt && (
                    <span>
                      {' • Modifiée le '}
                      {formatDate(skill.updatedAt.toString(), {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </p>
              </div>

              {/* Actions principales */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={toggleStatus}
                  variant="outline"
                  className={
                    skill.isActive
                      ? 'text-orange-600 hover:bg-orange-50 border-none'
                      : 'text-green-600 hover:bg-green-50 border-none'
                  }
                >
                  {skill.isActive ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Activer
                    </>
                  )}
                </Button>

                <Link href={`/admin/skills/${skill.id}/edit`}>
                  <Button variant="outline" className={'border-none text-black'}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </Link>

                <Button
                  onClick={handleDeleteClick}
                  variant="outline"
                  className="text-red-600 hover:text-red-800 border-none hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image principale */}
              <Card className="overflow-hidden bg-white">
                <div className="aspect-video bg-gray-100 relative">
                  {skill.imagePathPublicUrl ? (
                    <>
                      <img
                        src={skill.imagePathPublicUrl}
                        alt={skill.name}
                        className="h-full w-full object-cover"
                      />
                      {/* Overlay avec actions d'image */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/90 hover:bg-white border-none"
                            onClick={() => window.open(skill.imagePathPublicUrl!, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/90 hover:bg-white border-none"
                            onClick={() => {
                              const link = document.createElement('a')
                              if (skill.imagePathPublicUrl != null) {
                                link.href = skill.imagePathPublicUrl
                              }
                              link.download = `${skill.name}.jpg`
                              link.click()
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center">
                      <Image className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-sm">Aucune image associée</p>
                      <Link href={`/admin/skills/${skill.id}/edit`} className="mt-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Ajouter une image
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>

              {/* Description */}
              <Card className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>Description</span>
                  {!skill.description && (
                    <span className="text-sm font-normal text-gray-500">(vide)</span>
                  )}
                </h2>

                {skill.description ? (
                  <div className="prose prose-gray max-w-none">
                    <div className="text-gray-700">
                      <SafeHTML html={skill.description} className="line-clamp-12" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Aucune description pour cette compétence</p>
                    <Link href={`/admin/skills/${skill.id}/edit`}>
                      <Button size="sm" variant="outline" className="border-none">
                        <Edit className="h-4 w-4 mr-1" />
                        Ajouter une description
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>

              {/* Statistiques d'usage (placeholder pour futures fonctionnalités) */}
              <Card className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Projets utilisés</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {skill.isActive ? '100%' : '0%'}
                    </div>
                    <div className="text-sm text-gray-600">Visibilité</div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Conseil :</strong> Ajoutez cette compétence à vos projets pour
                    améliorer la visibilité de votre portfolio.
                  </p>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Informations rapides */}
              <Card className="p-6 bg-white">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID de la compétence
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        #{skill.id}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(skill.id.toString())}
                        className="h-6 w-6 p-0 border-none"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-600 font-medium">{skill.category}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <div className="flex items-center gap-2">
                      {skill.isActive ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 font-medium">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de création
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {formatDate(skill.createdAt.toString(), {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {skill.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dernière modification
                      </label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDate(skill.updatedAt.toString(), {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Actions rapides */}
              <Card className="p-6 bg-white">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>

                <div className="space-y-3">
                  <Link href={`/admin/skills/${skill.id}/edit`} className="block">
                    <Button variant="outline" className="w-full justify-start border-none">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier la compétence
                    </Button>
                  </Link>

                  <Button
                    onClick={toggleStatus}
                    variant="outline"
                    className="w-full justify-start border-none"
                  >
                    {skill.isActive ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Activer
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => copyToClipboard(window.location.href)}
                    variant="outline"
                    className="w-full justify-start border-none"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Copier le lien
                  </Button>

                  <hr className="my-2 bg-gray-500" />

                  <Button
                    onClick={handleDeleteClick}
                    variant="outline"
                    className="w-full justify-start border-none text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </Card>

              {/* Aperçu public (comment apparaîtra sur le site) */}
              <Card className="p-6 bg-white border-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu public</h3>

                <div className="rounded-lg p-4 bg-gray-50">
                  <div className="text-center">
                    {skill.imagePathPublicUrl && (
                      <div className="w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={skill.imagePathPublicUrl}
                          alt={skill.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <h4 className="font-semibold text-gray-900 mb-1">{skill.name}</h4>

                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mb-2">
                      {skill.category}
                    </span>

                    {skill.description && (
                      <SafeHTML
                        className="text-sm text-gray-600 line-clamp-2"
                        html={skill.description}
                      />
                    )}
                  </div>

                  {!skill.isActive && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
                      <p className="text-xs text-yellow-800">
                        ⚠️ Cette compétence n'est pas visible publiquement
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-none"
                    onClick={() => {
                      // Ici vous pourriez rediriger vers l'aperçu public
                      window.open(`/skills/${skill.id}`, '_blank')
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir sur le site
                  </Button>
                </div>
              </Card>

              {/* Métadonnées techniques */}
              <Card className="p-6 bg-white border-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Métadonnées</h3>

                <div className="space-y-3 text-sm">
                  {skill.imagePathPublicUrl && (
                    <div>
                      <label className="font-medium text-gray-700">Chemin de l'image:</label>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="flex-1 px-2 py-1 bg-gray-100 rounded text-xs font-mono truncate">
                          {skill.imagePathPublicUrl}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(skill.imagePathPublicUrl!)}
                          className="h-6 w-6 p-0 flex-shrink-0 border-none"
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="font-medium text-gray-700">Longueur description:</label>
                    <div className="mt-1">
                      <span className="text-gray-600">
                        {skill.description ? skill.description.length : 0} caractères
                      </span>
                    </div>
                  </div>

                  {isClient && (
                    <div>
                      <label className="font-medium text-gray-700">Dernière activité:</label>
                      <div className="mt-1">
                        <span className="text-gray-600">
                          {skill.updatedAt
                            ? `Modifiée il y a ${Math.floor((Date.now() - new Date(skill.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} jour(s)`
                            : `Créée il y a ${Math.floor((Date.now() - new Date(skill.createdAt).getTime()) / (1000 * 60 * 60 * 24))} jour(s)`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la compétence"
        message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette compétence ?"
        itemName={skill.name}
        isLoading={deleteModal.isLoading}
      />
    </>
  )
}

ShowSkill.layout = (page: React.ReactNode) => (
  <AdminLayout title="Détails skill" currentPath="/admin/skills">
    {page}
  </AdminLayout>
)
