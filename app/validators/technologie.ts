import vine from '@vinejs/vine'

/**
 * Schéma de validation pour la création d'une technologie
 */
export const createTechnologySchema = vine.compile(
  vine.object({
    name: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(191)
      .unique({ table: 'technologies', column: 'name' }),

    category: vine.string().trim().minLength(1).maxLength(191),

    imgPath: vine.file({
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'svg', 'webp', 'PNG'],
    }),

    lienOrigin: vine.string().trim().url().optional().nullable(),

    description: vine.string().trim().minLength(10).maxLength(1000).optional().nullable(),
  })
)

/**
 * Schéma de validation pour la mise à jour d'une technologie
 */
export const updateTechnologySchema = vine.compile(
  vine.object({
    name: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(191)
      .unique(async (db, value, field) => {
        if (!field.meta.id) return false
        const technology = await db
          .from('technologies')
          .where('name', value)
          .whereNot('id', field.meta.id)
          .first()
        return !technology
      })
      .optional(),

    category: vine.string().trim().minLength(1).maxLength(191).optional(),

    imgPath: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'svg', 'webp', 'PNG'],
      })
      .optional(),

    lienOrigin: vine.string().trim().url().optional().nullable(),

    description: vine.string().trim().minLength(10).maxLength(1000).optional().nullable(),
  })
)

/**
 * Schéma de validation pour les filtres
 */
export const technologyFiltersSchema = vine.compile(
  vine.object({
    search: vine.string().trim().optional(),
    category: vine.string().trim().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export type CreateTechnologyDTO = {
  name: string
  category: string
  imgPath: string
  lienOrigin?: string | null
  description?: string | null
}

export type UpdateTechnologyDTO = Partial<CreateTechnologyDTO>
