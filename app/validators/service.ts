import vine from '@vinejs/vine'

/**
 * Validator pour créer un service
 */
export const createServiceValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(100),

    description: vine.string().trim().minLength(10).maxLength(2000),

    image: vine.file({ size: '2mb', extnames: ['jpg', 'jpeg', 'png', 'svg', 'webp'] }).nullable(),

    price: vine.number().min(0).nullable(),

    isActive: vine.boolean(),

    displayOrder: vine.number().min(1).nullable(),
  })
)

/**
 * Validator pour mettre à jour un service
 */
export const updateServiceValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(100).optional(),

    description: vine.string().trim().minLength(10).maxLength(2000).optional(),

    image: vine
      .file({ size: '2mb', extnames: ['jpg', 'jpeg', 'png', 'svg', 'webp'] })
      .optional()
      .nullable(),

    price: vine.number().min(0).optional().nullable(),

    isActive: vine.boolean().optional(),

    displayOrder: vine.number().min(1).optional(),
  })
)

/**
 * Validator pour réorganiser l'ordre d'affichage des services
 */
export const reorderServicesValidator = vine.compile(
  vine.object({
    services: vine.array(
      vine.object({
        id: vine.number(),
        displayOrder: vine.number().min(1),
      })
    ),
  })
)
