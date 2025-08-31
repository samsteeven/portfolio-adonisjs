import vine from '@vinejs/vine'

export const createSkillValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(191),
    category: vine.string().minLength(2).maxLength(100),
    description: vine.string().optional().nullable(),
    imagePath: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      })
      .optional(),
    isActive: vine.boolean().optional(),
  })
)

export const updateSkillValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(191).optional(),
    category: vine.string().minLength(2).maxLength(100).optional(),
    description: vine.string().optional().nullable().optional(),
    imagePath: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      })
      .nullable()
      .optional(),
    isActive: vine.boolean().optional(),
  })
)

export type CreateSkillValidatorDTO = {
  name: string
  category: string
  description?: string | null
  imagePath?: string | null
  isActive?: boolean
}
export type UpdateSkillValidatorDTO = Partial<CreateSkillValidatorDTO>
