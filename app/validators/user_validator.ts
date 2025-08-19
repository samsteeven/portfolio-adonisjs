import vine from '@vinejs/vine'
import { UserRole } from '#enums/user_role'

/**
 * Schéma de validation pour la création d'utilisateur
 */
export const createUserSchema = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .trim()
      .toLowerCase()
      .unique(async (db, value) => {
        const user = db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().minLength(4),
    username: vine.string().minLength(2).maxLength(50).trim(),
    role: vine.enum(Object.values(UserRole)),
    isActive: vine.boolean().optional(),
  })
)

/**
 * Schéma de validation pour la mise à jour d'utilisateur
 */
export const updateUserSchema = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .trim()
      .unique(async (db, value, field) => {
        const user = db.from('users').where('email', value).whereNot('id', field.meta.userId)
        return !user
      }),
    password: vine.string().minLength(4).optional(),
    username: vine.string().minLength(2).maxLength(50).trim().optional(),
    role: vine.enum(Object.values(UserRole)).optional(),
    isActive: vine.boolean().optional(),
  })
)

/**
 * Types TypeScript dérivés des schémas
 */
export type CreateUserDTO = {
  email: string
  password: string
  username: string
  role: UserRole
  isActive?: boolean
}

export type UpdateUserDTO = Partial<CreateUserDTO>
