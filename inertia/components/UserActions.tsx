import { useState } from 'react'
import { Link, useForm, usePage } from '@inertiajs/react'
import { Edit, Eye, Power, PowerOff, Trash2 } from 'lucide-react'
import ConfirmationModal from './ConfirmationModal'
import { AuthenticatedUser, InertiaProps } from '~/types'
import UserInfoModal from '~/components/UserInfoModal'
import { UserRole } from '~/enums/user_role'

interface UserActionsProps {
  user: AuthenticatedUser
}

export default function UserActions({ user }: UserActionsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const { auth } = usePage<InertiaProps>().props
  const { delete: deleteUser, processing: isDeleting } = useForm()
  const { patch: toggleStatus, processing: isToggling } = useForm()
  const currentUser = auth!.user
  const handleDelete = () => {
    deleteUser(`/admin/users/${user.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setShowDeleteModal(false)
      },
    })
  }
  const handleToggleStatus = () => {
    toggleStatus(`/admin/users/${user.id}/toggle-status`, {
      preserveScroll: true,
      onSuccess: () => {
        setShowStatusModal(false)
      },
    })
  }

  const openStatusModal = () => {
    setShowStatusModal(true)
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {/* Voir l'utilisateur */}
        {((currentUser.role === UserRole.VISITOR && user.id === currentUser.id) ||
          currentUser.role === UserRole.ADMIN) && (
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-2 text-blue-600 hover:text-blue-900 hover:cursor-pointer hover:bg-blue-50 rounded-lg transition-colors"
            title="Voir l'utilisateur"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        {/* Éditer l'utilisateur */}
        {((currentUser.role === UserRole.VISITOR && user.id === currentUser.id) ||
          currentUser.role === UserRole.ADMIN) && (
          <Link
            href={`/admin/users/${user.id}/edit`}
            className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Éditer l'utilisateur"
          >
            <Edit className="w-4 h-4" />
          </Link>
        )}

        {/* Toggle statut */}
        {currentUser.role === UserRole.ADMIN && (
          <button
            onClick={openStatusModal}
            disabled={isToggling}
            className={`p-2 rounded-lg transition-colors ${
              user.isActive
                ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50'
                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
            }`}
            title={user.isActive ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
          >
            {isToggling ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : user.isActive ? (
              <PowerOff className="w-4 h-4" />
            ) : (
              <Power className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Supprimer l'utilisateur */}
        {currentUser.role === UserRole.ADMIN && (
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer l'utilisateur"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Modal de confirmation de changement de statut */}
      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleToggleStatus}
        title={user.isActive ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
        message={
          user.isActive
            ? 'Êtes-vous sûr de vouloir désactiver cet utilisateur ?'
            : 'Êtes-vous sûr de vouloir activer cet utilisateur ?'
        }
        itemName={`${user.username}`}
        isLoading={isToggling}
        actionType={user.isActive ? 'deactivate' : 'activate'}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir le supprimer ?`}
        itemName={`${user.username}`}
        isLoading={isDeleting}
        actionType="delete"
      />
      <UserInfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} user={user} />
    </>
  )
}
