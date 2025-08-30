import { useState } from 'react'
import { Form, Link } from '@inertiajs/react'
import {
  ArrowLeft,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Shield,
  Upload,
  User,
  UserPlus,
} from 'lucide-react'
import { USER_ROLE_LABELS, UserRole } from '~/enums/user_role'
import { AuthenticatedUser } from '~/types'

interface UserFormProps {
  user?: AuthenticatedUser
  isEditing?: boolean
}

export default function UserForm({ user, isEditing = false }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const formAction = isEditing && user?.id ? `/admin/users/${user.id}` : '/admin/users'
  const formMethod = isEditing ? 'patch' : 'post'

  const title = isEditing ? "Modifier l'utilisateur" : 'Nouvel utilisateur'
  const description = isEditing
    ? "Modifiez les informations de l'utilisateur"
    : 'Créez un nouveau compte utilisateur'
  const submitText = isEditing ? 'Mettre à jour' : "Créer l'utilisateur"
  const processingText = isEditing ? 'Mise à jour...' : 'Création...'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={'/admin/users'}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux utilisateurs
        </Link>
      </div>

      <div className="rounded-lg  border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            {isEditing ? (
              <Edit className="w-5 h-5 text-blue-600" />
            ) : (
              <UserPlus className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>

        <Form
          action={formAction}
          method={formMethod}
          disableWhileProcessing
          resetOnSuccess={!isEditing}
          options={{
            preserveScroll: true,
          }}
          encType="multipart/form-data"
          className="space-y-6"
        >
          {({ processing, errors, reset, isDirty }) => (
            <>
              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nom d'utilisateur *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      defaultValue={user?.username || ''}
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors?.username ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nom d'utilisateur"
                      required
                    />
                  </div>
                  {errors?.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      defaultValue={user?.email || ''}
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors?.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="email@exemple.com"
                      required
                    />
                  </div>
                  {errors?.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Mot de passe */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mot de passe {!isEditing && '*'}
                    {isEditing && (
                      <span className="text-gray-500 text-xs">(laisser vide pour conserver)</span>
                    )}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors?.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={isEditing ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                      required={!isEditing}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors?.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Rôle et statut */}
              {((isEditing && user?.role === UserRole.ADMIN) || !isEditing) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        id="role"
                        name="role"
                        defaultValue={user?.role || UserRole.VISITOR}
                        className={`w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors?.role ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors?.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        defaultChecked={user?.isActive ?? true}
                        className={`w-4 h-4 text-blue-600  focus:outline-none border-gray-300 rounded focus:ring-blue-500 ${
                          errors?.isActive ? 'border-red-300' : ''
                        }`}
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                        Compte actif
                      </label>
                    </div>
                    {errors?.isActive && (
                      <p className="mt-1 text-sm text-red-600">{errors.isActive}</p>
                    )}
                  </div>
                </div>
              )}

              {/* SubInfo */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-800">
                  Informations supplémentaires
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label
                      htmlFor="profilGithub"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Profil Github
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {/* GitHub SVG icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.867 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.529 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.111-4.555-4.944 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.699 1.028 1.592 1.028 2.683 0 3.842-2.337 4.687-4.566 4.936.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.577.688.48C19.135 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                          />
                        </svg>
                      </span>
                      <input
                        type="url"
                        id="profilGithub"
                        name="subInfo[profilGithub]"
                        defaultValue={user?.subInfo?.profilGithub || ''}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent ${
                          errors?.['subInfo.profilGithub'] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    {errors?.['subInfo.profilGithub'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['subInfo.profilGithub']}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="profilLinkedin"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Profil LinkedIn
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {/* LinkedIn SVG icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                        >
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z" />
                        </svg>
                      </span>
                      <input
                        type="url"
                        id="profilLinkedin"
                        name="subInfo[profilLinkedin]"
                        defaultValue={user?.subInfo?.profilLinkedin || ''}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors?.['subInfo.profilLinkedin'] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="https://www.linkedin.com/in/username"
                      />
                    </div>
                    {errors?.['subInfo.profilLinkedin'] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors['subInfo.profilLinkedin']}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="profilTwitter"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Profil Twitter/X
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {/* Twitter/X SVG icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                        >
                          <path d="M22.162 5.656c-.793.352-1.645.59-2.538.697a4.48 4.48 0 001.963-2.475 8.94 8.94 0 01-2.828 1.082A4.478 4.478 0 0015.448 4c-2.482 0-4.495 2.013-4.495 4.495 0 .352.04.695.116 1.022-3.74-.188-7.054-1.98-9.27-4.704a4.48 4.48 0 00-.608 2.262c0 1.56.795 2.936 2.006 3.744a4.48 4.48 0 01-2.037-.563v.057c0 2.18 1.55 4.002 3.607 4.418a4.49 4.49 0 01-2.03.077c.573 1.788 2.236 3.09 4.205 3.125A8.99 8.99 0 012 19.54a12.7 12.7 0 006.88 2.017c8.253 0 12.774-6.837 12.774-12.774 0-.195-.004-.39-.013-.583a9.13 9.13 0 002.24-2.344z" />
                        </svg>
                      </span>
                      <input
                        type="url"
                        id="profilTwitter"
                        name="subInfo[profilTwitter]"
                        defaultValue={user?.subInfo?.profilTwitter || ''}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors?.['subInfo.profilTwitter'] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="https://x.com/username"
                      />
                    </div>
                    {errors?.['subInfo.profilTwitter'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['subInfo.profilTwitter']}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="profilMail"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email public
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {/* Envelope SVG icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.876 1.789l-7.5 6a2.25 2.25 0 01-2.748 0l-7.5-6A2.25 2.25 0 012.25 6.993V6.75"
                          />
                        </svg>
                      </span>
                      <input
                        type="email"
                        id="profilMail"
                        name="subInfo[profilMail]"
                        defaultValue={user?.subInfo?.profilMail || ''}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors?.['subInfo.profilMail'] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="email.public@example.com"
                      />
                    </div>
                    {errors?.['subInfo.profilMail'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['subInfo.profilMail']}</p>
                    )}
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                      Photo de profil
                    </label>
                    <div className="space-y-2">
                      <div className="relative">
                        <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="file"
                          id="photoPath"
                          name="subInfo[photoPath]"
                          accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent ${
                            errors?.['subInfo.photoPath'] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {user?.subInfo?.photoPathPublicUrl && (
                        <p className="text-xs text-gray-500">
                          Fichier actuel: {user.subInfo.photoPathPublicUrl.split('/').pop()}
                        </p>
                      )}
                    </div>
                    {errors?.['subInfo.photoPath'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['subInfo.photoPath']}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        id="phone"
                        name="subInfo[phone]"
                        defaultValue={user?.subInfo?.phone || ''}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent ${
                          errors?.['subInfo.phone'] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+237 6 00 00 00 00"
                      />
                    </div>
                    {errors?.['subInfo.phone'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['subInfo.phone']}</p>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-3 xl:col-span-4">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="subInfo[bio]"
                    defaultValue={user?.subInfo?.bio || ''}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors?.['subInfo.bio'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    rows={4}
                    placeholder="Quelques mots sur toi"
                  />
                  {errors?.['subInfo.bio'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['subInfo.bio']}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <Link
                  as="button"
                  onClick={() => reset()}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={!isDirty || processing}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors ${
                    processing || !isDirty
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-blue-700 hover:cursor-pointer'
                  }`}
                >
                  {processing && (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth={4}
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4.293 9.293a1 1 0 011.414 0L12 15.586l6.293-6.293a1 1 0 011.414 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 010-1.414z"
                      />
                    </svg>
                  )}
                  {processing ? processingText : submitText}
                </button>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  )
}
