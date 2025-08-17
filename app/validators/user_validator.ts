import vine from '@vinejs/vine'
import { UserRole } from '#enums/user_role'

/**
 * Schéma de validation pour la création d'utilisateur
 */
export const createUserSchema = vine.object({
  email: vine.string().email().trim(),
  password: vine
    .string()
    .minLength(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  first_name: vine.string().minLength(2).maxLength(50).trim(),
  last_name: vine.string().minLength(2).maxLength(50).trim(),
  role: vine.enum(Object.values(UserRole)),
  is_active: vine.boolean(),
})

/**
 * Schéma de validation pour la mise à jour d'utilisateur
 */
export const updateUserSchema = vine.object({
  email: vine.string().email().trim().optional(),
  password: vine
    .string()
    .minLength(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .optional(),
  first_name: vine.string().minLength(2).maxLength(50).trim().optional(),
  last_name: vine.string().minLength(2).maxLength(50).trim().optional(),
  role: vine.enum(Object.values(UserRole)).optional(),
  is_active: vine.boolean().optional(),
})

/**
 * Schéma de validation pour la recherche d'utilisateurs
 */
export const searchUsersSchema = vine.object({
  page: vine.number().positive(),
  limit: vine.number().positive().max(100),
  search: vine.string().maxLength(100).optional(),
  role: vine.enum(['all', ...Object.values(UserRole)]),
})

/**
 * Types TypeScript dérivés des schémas
 */
export type CreateUserData = {
  email: string
  password: string
  first_name: string
  last_name: string
  role: UserRole
  is_active: boolean
}

export type UpdateUserData = Partial<CreateUserData>

export type SearchUsersData = {
  page: number
  limit: number
  search?: string
  role: 'all' | UserRole
}
