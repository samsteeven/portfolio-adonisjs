import vine from '@vinejs/vine'
import EmojiService from '#services/emoji_service'

export const createCommentaireValidator = vine.compile(
  vine.object({
    message: vine.string().minLength(5).maxLength(1000),
  })
)

export const updateCommentaireValidator = vine.compile(
  vine.object({
    message: vine.string().minLength(5).maxLength(1000).optional(),
  })
)
// Validation pour ajouter une réaction
export const addReactionValidator = vine.compile(
  vine.object({
    reaction: vine.string().in(EmojiService.getAllReactions()).optional(),
  })
)
