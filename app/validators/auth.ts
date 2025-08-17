import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().toLowerCase().email().normalizeEmail().trim(),
    password: vine.string(),
    rememberMe: vine.boolean().optional(),
  })
)
