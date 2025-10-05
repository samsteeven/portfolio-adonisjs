import React, { useState } from 'react'
import { useForm, router } from '@inertiajs/react'
import AdminLayout from '~/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import SafeHTML from '~/components/safeHTML'
import { Plus, HelpCircle, Edit, Trash2, Search, ExternalLink } from 'lucide-react'
import { truncateText } from '~/utils/utils_string'
import TinyMCEEditor from '~/components/TinyMCEEditor'
import ConfirmationModal from '~/components/ConfirmationModal'

interface Faq {
  id: number
  question: string
  answer: string
  createdAt: string
  updatedAt: string
}

interface FaqAdminProps {
  faqs: Faq[]
}

export default function FaqAdmin({ faqs }: FaqAdminProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    faqId: null as number | null,
    faqQuestion: '',
    isLoading: false,
  })

  const { data, setData, post, patch, processing, errors, reset, isDirty } = useForm({
    question: '',
    answer: '',
    isVisible: true,
  })

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingFaq) {
      patch(`/admin/faqs/${editingFaq.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          reset()
          setEditingFaq(null)
          setShowCreateForm(false)
        },
      })
    } else {
      post('/admin/faqs', {
        preserveScroll: true,
        onSuccess: () => {
          reset()
          setShowCreateForm(false)
        },
      })
    }
  }

  const handleEdit = (faq: Faq) => {
    setData({
      question: faq.question,
      answer: faq.answer,
    })
    setEditingFaq(faq)
    setShowCreateForm(true)
  }

  const handleDelete = (id: number, question: string) => {
    setDeleteModal({
      isOpen: true,
      faqId: id,
      faqQuestion: question,
      isLoading: false,
    })
  }

  const confirmDelete = () => {
    if (!deleteModal.faqId) return

    setDeleteModal((prev) => ({ ...prev, isLoading: true }))

    router.delete(`/admin/faqs/${deleteModal.faqId}`, {
      preserveScroll: true,
      onSuccess: () => {
        setDeleteModal({
          isOpen: false,
          faqId: null,
          faqQuestion: '',
          isLoading: false,
        })
      },
      onError: () => {
        setDeleteModal((prev) => ({ ...prev, isLoading: false }))
      },
    })
  }

  const cancelForm = () => {
    reset()
    setShowCreateForm(false)
    setEditingFaq(null)
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">FAQ</h1>
                <p className="text-gray-600 mt-2">Gérez les questions fréquemment posées</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.visit('/misc/faq')}
                  className="border-none"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir en direct
                </Button>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle FAQ
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total FAQ</p>
                    <p className="text-xl font-semibold">{faqs.length}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Search */}
          <Card className="p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une FAQ par question ou réponse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {editingFaq ? 'Modifier la FAQ' : 'Créer une nouvelle FAQ'}
                </h2>
                <Button variant="outline" className="border-none" onClick={cancelForm}>
                  Annuler
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="question" className="text-sm font-medium">
                    Question *
                  </Label>
                  <Input
                    id="question"
                    type="text"
                    value={data.question}
                    onChange={(e) => setData('question', e.target.value)}
                    placeholder="Comment puis-je vous contacter ?"
                    className="mt-1"
                    required
                  />
                  {errors.question && (
                    <p className="text-sm text-red-600 mt-1">{errors.question}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="answer" className="text-sm font-medium">
                    Réponse *
                  </Label>
                  <div className="mt-1">
                    <TinyMCEEditor
                      value={data.answer}
                      onEditorChange={(content) => setData('answer', content)}
                      placeholder="Vous pouvez me contacter via le formulaire de contact ou par email à..."
                      height={200}
                    />
                  </div>
                  {errors.answer && <p className="text-sm text-red-600 mt-1">{errors.answer}</p>}
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={cancelForm}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={processing || !isDirty}>
                    {processing
                      ? 'Enregistrement...'
                      : editingFaq
                        ? 'Mettre à jour'
                        : 'Créer la FAQ'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <Card key={faq.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <HelpCircle className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <SafeHTML html={faq.question} />
                      </h3>

                      <div className="text-gray-600 mb-4">
                        <SafeHTML html={faq.answer} className="line-clamp-3" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id, faq.question)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'Aucune FAQ trouvée' : 'Aucune FAQ créée'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? `Aucune FAQ ne correspond à "${searchTerm}"`
                    : 'Commencez par créer votre première FAQ pour aider vos visiteurs.'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer votre première FAQ
                  </Button>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Supprimer la FAQ"
        message="Cette action est irréversible. La FAQ sera définitivement supprimée."
        itemName={truncateText(deleteModal.faqQuestion, 50)}
        isLoading={deleteModal.isLoading}
      />
    </>
  )
}

FaqAdmin.layout = (page: React.ReactNode) => (
  <AdminLayout title="FAQ" description="Gestion des FAQ" currentPath="/admin/faqs">
    {page}
  </AdminLayout>
)
