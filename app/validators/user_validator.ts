import vine from '@vinejs/vine'
import { UserRole } from '#enums/user_role'
import { phoneRule } from '#validators/rules/phone'

/**
 * Schéma pour les informations supplémentaires de l'utilisateur
 */
const subInfoSchema = vine.object({
  profilGithub: vine.string().url().optional(),
  profilLinkedin: vine.string().url().optional(),
  profilTwitter: vine.string().url().optional(),
  profilMail: vine.string().email().optional(),
  profilDiscord: vine.string().url().optional(),
  photoPath: vine
    .file({
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    })
    .optional(),
  phone: vine.string().use(phoneRule({})).optional(),
  bio: vine.string().optional(),
  bio2: vine.string().optional(),
  cv: vine
    .file({
      size: '5mb',
      extnames: ['pdf'],
    })
    .optional(),
})

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
      .unique({ table: 'users', column: 'email' }),
    password: vine
      .string()
      .minLength(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    username: vine.string().minLength(2).maxLength(50).trim(),
    role: vine.enum(Object.values(UserRole)),
    provider: vine.string().optional(),
    isActive: vine.boolean().optional(),
    subInfo: subInfoSchema.clone().optional(),
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
      .toLowerCase()
      .unique(async (db, value, field) => {
        if (!field.meta.userId) return false
        const user = await db
          .from('users')
          .where('email', value)
          .whereNot('id', field.meta.userId)
          .first()
        return !user
      })
      .optional(),
    password: vine
      .string()
      .minLength(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .optional(),
    username: vine.string().minLength(2).maxLength(50).trim().optional(),
    role: vine.enum(Object.values(UserRole)).optional(),
    isActive: vine.boolean().optional(),
    provider: vine.string().optional(),
    subInfo: subInfoSchema.clone().optional(),
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
  provider?: string
  subInfo?: {
    profilGithub?: string
    profilLinkedin?: string
    profilTwitter?: string
    profilMail?: string
    profilDiscord?: string
    photoPath?: string
    phone?: string
    bio?: string
    bio2?: string
    cv?: string
  }
}

export type UpdateUserDTO = Partial<CreateUserDTO>
