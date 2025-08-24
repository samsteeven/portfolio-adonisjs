import React from 'react'
import AdminLayout from '~/layout/AdminLayout'
import UserForm from '~/pages/admin/users/user_form'
import { AuthenticatedUser } from '~/types'

export default function EditUser({ user }: { user: AuthenticatedUser }) {
  return <UserForm user={user} isEditing={true} />
}

EditUser.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Modifier utilisateur"
    description="Modifier les informations de l\'utilisateur"
    currentPath="/admin/users"
  >
    {page}
  </AdminLayout>
)
