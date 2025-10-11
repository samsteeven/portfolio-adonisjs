import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import { isValidPhoneNumber } from 'libphonenumber-js'
import type { CountryCode } from 'libphonenumber-js'

/**
 * Options acceptées par la règle de validation phone
 */
type Options = {
  defaultCountry?: CountryCode
}

/**
 * Fonction de validation pour les numéros de téléphone
 */
async function phone(value: unknown, options: Options, field: FieldContext) {
  /**
   * On s'attend à ce que la valeur soit une chaîne de caractères
   */
  if (typeof value !== 'string') {
    return
  }

  /**
   * Validation avec libphonenumber-js
   */
  try {
    const isValid = isValidPhoneNumber(value, options.defaultCountry)

    if (!isValid) {
      field.report("Le numéro de téléphone {{ value }} n'est pas valide", 'phone', field)
    }
  } catch (error) {
    field.report("Le numéro de téléphone {{ value }} n'est pas valide", 'phone', field)
  }
}

/**
 * Convertit la règle en une règle VineJS
 */
export const phoneRule = vine.createRule(phone)
