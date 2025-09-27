import vine from '@vinejs/vine'

/**
 * Validateur pour les commentaires d'utilisateurs authentifiés
 */
export const createAuthenticatedCommentValidator = vine.compile(
  vine.object({
    message: vine.string().trim().minLength(1).maxLength(1000).escape(),
  })
)

/**
 * Validateur pour les commentaires d'invités (non authentifiés)
 */
export const createGuestCommentValidator = vine.compile(
  vine.object({
    message: vine.string().trim().minLength(1).maxLength(1000).escape(),

    guestName: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(100)
      .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/)
      .escape(),

    guestEmail: vine.string().email().normalizeEmail().optional(),

    guestPhone: vine.string().trim().optional(),

    // Champ honeypot pour la protection anti-spam
    website: vine
      .string()
      .optional()
      .transform((value) => {
        // Si le champ website est rempli, c'est probablement un bot
        if (value && value.trim() !== '') {
          throw new Error('Spam détecté')
        }
        return undefined
      }),
  })
)

/**
 * Validateur pour ajouter/modifier une réaction
 */
export const addReactionValidator = vine.compile(
  vine.object({
    reaction: vine.string().nullable().optional(),
  })
)

/**
 * Validateur pour les filtres de recherche
 */
export const commentFilterValidator = vine.compile(
  vine.object({
    search: vine.string().trim().maxLength(255).optional(),

    hasReaction: vine.enum(['true', 'false', '']).optional(),

    commentType: vine.enum(['authenticated', 'guest', '']).optional(),

    country: vine.string().trim().maxLength(100).optional(),

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
