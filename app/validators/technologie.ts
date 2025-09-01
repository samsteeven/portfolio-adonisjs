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
      extnames: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
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
        extnames: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
      })
      .optional(),

    lienOrigin: vine.string().trim().url().optional().nullable(),

    description: vine.string().trim().minLength(10).maxLength(1000).optional().nullable(),
  })
)

/**
 * Schéma de validation pour la recherche de technologies
 */
export const searchTechnologySchema = vine.compile(
  vine.object({
    search: vine.string().trim().minLength(1).maxLength(100).optional(),

    category: vine.string().trim().minLength(1).maxLength(191).optional(),

    page: vine.number().min(1).optional(),

    limit: vine.number().min(1).max(100).optional(),
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

/**
 * Messages de validation personnalisés
 */
export const technologyValidationMessages = {
  'name.required': 'Le nom de la technologie est requis',
  'name.minLength': 'Le nom doit contenir au moins 1 caractère',
  'name.maxLength': 'Le nom ne peut pas dépasser 191 caractères',
  'name.unique': 'Une technologie avec ce nom existe déjà',

  'category.required': 'La catégorie est requise',
  'category.minLength': 'La catégorie doit contenir au moins 1 caractère',
  'category.maxLength': 'La catégorie ne peut pas dépasser 191 caractères',

  'imgPath.file': "Le fichier image n'est pas valide",
  'imgPath.file.size': "L'image ne doit pas dépasser 2MB",
  'imgPath.file.extnames': "L'image doit être au format JPG, JPEG, PNG, SVG ou WebP",

  'lienOrigin.url': "Le lien d'origine doit être une URL valide",

  'description.minLength': 'La description doit contenir au moins 10 caractères',
  'description.maxLength': 'La description ne peut pas dépasser 1000 caractères',

  'page.min': 'Le numéro de page doit être supérieur à 0',
  'limit.min': 'La limite doit être supérieure à 0',
  'limit.max': 'La limite ne peut pas dépasser 100',
}

export type CreateTechnologyDTO = {
  name: string
  category: string
  imgPath: string
  lienOrigin?: string | null
  description?: string | null
}

export type UpdateTechnologyDTO = Partial<CreateTechnologyDTO>
