import { Form } from '@inertiajs/react'
import { X, Send, Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ContactRequestType } from '~/types/contact_request'
import { toast } from 'sonner'

interface ContactRequestReplyModalProps {
  contactRequest: ContactRequestType
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ContactRequestReplyModal({
  contactRequest,
  isOpen,
  onClose,
  onSuccess,
}: ContactRequestReplyModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Répondre à la demande</h2>
              <p className="text-gray-600 mt-1">
                Répondre à {contactRequest.fullName} ({contactRequest.email})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{contactRequest.fullName}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{contactRequest.message}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {contactRequest.email}
                  </span>
                  {contactRequest.phone && <span>{contactRequest.phone}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Reply Form */}
          <Form
            method="post"
            action={`/admin/contact-requests/${contactRequest.id}/reply`}
            disableWhileProcessing
            resetOnSuccess
            onSuccess={() => {
              toast.success('Réponse envoyée avec succès')
              if (onSuccess) onSuccess()
              onClose()
            }}
            onError={() => {
              toast.error("Erreur lors de l'envoi de la réponse")
            }}
          >
            <div className="space-y-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet de l'email
                </label>
                <Input
                  id="subject"
                  name="subject"
                  defaultValue={`Re: Demande de contact de ${contactRequest.fullName}`}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Sujet de l'email"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message de réponse
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={8}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Écrivez votre réponse ici..."
                />
              </div>

              <div>
                <label
                  htmlFor="adminNotes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notes administratives (optionnel)
                </label>
                <Textarea
                  id="adminNotes"
                  name="adminNotes"
                  rows={3}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Notes internes pour votre référence..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-300 hover:border-gray-400"
                >
                  Annuler
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer la réponse
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  )
}
