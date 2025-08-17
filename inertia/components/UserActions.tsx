import { useState } from 'react'
import { useForm, Link } from '@inertiajs/react'
import { Eye, Edit, Trash2, Power, PowerOff } from 'lucide-react'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import { UserRole } from '~/enums/user_role'

interface UserActionsProps {
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
    role: UserRole
    is_active: boolean
  }
}

export default function UserActions({ user }: UserActionsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const { delete: deleteUser, processing: isDeleting } = useForm()
  const { patch: toggleStatus, processing: isToggling } = useForm()

  const handleDelete = () => {
    deleteUser(`/admin/users/${user.id}`, {
      onSuccess: () => {
        setShowDeleteModal(false)
      }
    })
  }

  const handleToggleStatus = () => {
    toggleStatus(`/admin/users/${user.id}/toggle-status`)
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {/* Voir l'utilisateur */}
        <Link
          href={`/admin/users/${user.id}`}
          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
          title="Voir l'utilisateur"
        >
          <Eye className="w-4 h-4" />
        </Link>

        {/* Éditer l'utilisateur */}
        <Link
          href={`/admin/users/${user.id}/edit`}
          className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Éditer l'utilisateur"
        >
          <Edit className="w-4 h-4" />
        </Link>

        {/* Toggle statut */}
        <button
          onClick={handleToggleStatus}
          disabled={isToggling}
          className={`p-2 rounded-lg transition-colors ${
            user.is_active
              ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50'
              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
          }`}
          title={user.is_active ? 'Désactiver l\'utilisateur' : 'Activer l\'utilisateur'}
        >
          {isToggling ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : user.is_active ? (
            <PowerOff className="w-4 h-4" />
          ) : (
            <Power className="w-4 h-4" />
          )}
        </button>

        {/* Supprimer l'utilisateur */}
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={isDeleting}
          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
          title="Supprimer l'utilisateur"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.first_name} ${user.last_name}" ?`}
        itemName={`${user.first_name} ${user.last_name}`}
        isLoading={isDeleting}
      />
    </>
  )
}
