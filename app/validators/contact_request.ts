import vine from '@vinejs/vine'

/**
 * Validator pour créer une demande de contact
 */
export const createContactRequestValidator = vine.compile(
  vine.object({
    firstName: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(50)
      .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/),

    lastName: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(50)
      .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/),

    email: vine.string().email().normalizeEmail(),

    phone: vine.string().trim().optional(),

    message: vine.string().trim().minLength(10).maxLength(2000),

    serviceId: vine.number().positive().optional(),

    // Champ honeypot pour protection anti-spam
    website: vine
      .string()
      .optional()
      .transform((value) => {
        if (value && value.trim() !== '') {
          throw new Error('Spam détecté')
        }
        return undefined
      }),
  })
)

/**
 * Validator pour mettre à jour le statut d'une demande (admin)
 */
export const updateContactRequestStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['pending', 'read', 'replied', 'closed']),

    adminNotes: vine.string().trim().maxLength(1000).optional(),
  })
)

/**
 * Validator pour les filtres de recherche des demandes de contact
 */
export const contactRequestFilterValidator = vine.compile(
  vine.object({
    search: vine.string().trim().maxLength(255).optional(),

    status: vine.enum(['pending', 'read', 'replied', 'closed', '']).optional(),

    serviceId: vine.number().positive().optional(),

    hasService: vine.enum(['true', 'false', '']).optional(),

    dateFrom: vine
      .date({
        formats: ['YYYY-MM-DD'],
      })
      .optional(),

    dateTo: vine
      .date({
        formats: ['YYYY-MM-DD'],
      })
      .optional(),

    page: vine.number().min(1).optional(),

    limit: vine.number().min(5).max(50).optional(),
  })
)

/**
 * Validator pour répondre à une demande de contact
 */
export const replyToContactRequestValidator = vine.compile(
  vine.object({
    subject: vine.string().trim().minLength(5).maxLength(200),

    message: vine.string().trim().minLength(10).maxLength(5000),

    adminNotes: vine.string().trim().maxLength(1000).optional(),
  })
)
