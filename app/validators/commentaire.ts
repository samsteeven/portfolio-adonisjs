import vine from '@vinejs/vine'
import EmojiService from '#services/emoji_service'

export const createCommentaireValidator = vine.compile(
  vine.object({
    message: vine.string().minLength(5).maxLength(1000),
    name: vine.string().minLength(2).maxLength(100),
    email: vine.string().email().maxLength(191).normalizeEmail(),
  })
)

export const updateCommentaireValidator = vine.compile(
  vine.object({
    message: vine.string().minLength(5).maxLength(1000).optional(),
    name: vine.string().minLength(2).maxLength(100).optional(),
    email: vine.string().email().maxLength(191).normalizeEmail().optional(),
  })
)
// Validation pour ajouter une réaction
export const addReactionValidator = vine.compile(
  vine.object({
    reaction: vine.string().in(EmojiService.getAllReactions()).optional(),
  })
)
