import React from 'react'
import AdminLayout from '~/layout/AdminLayout'
import UserForm from '~/pages/admin/users/user_form'

export default function CreateUser() {
  return <UserForm />
}

CreateUser.layout = (page: React.ReactNode) => (
  <AdminLayout
    title="Nouvel utilisateur"
    description="Créer un nouveau compte utilisateur"
    currentPath="/admin/users"
  >
    {page}
  </AdminLayout>
)
